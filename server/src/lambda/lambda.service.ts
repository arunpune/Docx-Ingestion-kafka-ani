import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ImapFlow } from 'imapflow'
import { extractBody, extractAttachments } from '../helpers/parser'
import { kafkaService } from '../lib/kafka'
import { simpleParser, ParsedMail } from 'mailparser'
import crypto from 'node:crypto'
import { Event, IngestionObject } from '../types'
import { redis } from '../lib/redis'

@Injectable()
export class LambdaService {
  private readonly logger = new Logger(LambdaService.name)
  private isProcessing = false

  /**
   * Scheduled task that polls the IMAP mailbox every 30 seconds.
   *
   * Responsibilities:
   * - Connects to the IMAP server and opens the mailbox.
   * - Searches for unread emails.
   * - Processes new messages and publishes events to Kafka.
   * - Marks processed messages as seen.
   * - Handles errors and ensures proper logout and resource cleanup.
   *
   * @returns {Promise<void>} Resolves when polling and processing are complete.
   */
  private readonly cronSchedule = process.env.CRON_SCHEDULE || '*/30 * * * * *';

  @Cron(process.env.CRON_SCHEDULE || '*/30 * * * * *', {
    name: 'document_classifier_job',
  })
  async handleCron() {
    // if (this.isProcessing) {
    //   this.logger.warn('Previous polling still in progress, skipping...')
    //   return
    // }

    this.isProcessing = true
    this.logger.log('Polling started')

    const client = new ImapFlow({
      host: process.env.IMAP_SERVER!,
      port: 993,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
      logger: false,
    })

    try {
      await client.connect()

      const mailbox = await client.mailboxOpen('INBOX', { readOnly: false })
      this.logger.log(`Connected to mailbox: ${mailbox.mailboxId}`)

      const searchResults = await client.search({ seen: false })

      if (!searchResults || searchResults.length === 0) {
        this.logger.log('No unread emails found')
        return
      }

      this.logger.log(`Found ${searchResults.length} unread emails`)

      const processedCount = await this.processMessages(client, searchResults.reverse().slice(0, 1));

      this.logger.log(`Successfully processed ${processedCount}/${searchResults.length} emails`)

    } catch (error) {
      this.logger.error('IMAP polling error:', error)
      throw error
    } finally {
      try {
        if (client.usable) {
          await client.logout()
          this.isProcessing = false
        }
      } catch (logoutError) {
        this.logger.error('Error during IMAP logout:', logoutError)
      }

    }
  }

  /**
   * Processes a batch of email messages.
   *
   * Responsibilities:
   * - Fetches messages by UID.
   * - Parses email content and attachments.
   * - Constructs ingestion objects and event payloads.
   * - Publishes messages to Kafka topics.
   * - Updates Redis with processing status.
   * - Marks processed messages as seen.
   * - Handles errors during message processing.
   *
   * @param {ImapFlow} client - IMAP client instance.
   * @param {number[]} messageIds - Array of message UIDs to process.
   * @returns {Promise<number>} Number of successfully processed messages.
   */
  private async processMessages(client: ImapFlow, messageIds: number[]): Promise<number> {
    let processedCount = 0
    const processedUids: number[] = []

    try {
      const batchSize = 10
      for (let i = 0; i < messageIds.length; i += batchSize) {
        const batch = messageIds.slice(i, i + batchSize)

        for await (const msg of client.fetch(batch, {
          source: true,
          uid: true,
          flags: true
        })) {
          try {
            if (msg.flags?.has('\\Seen')) {
              this.logger.debug(`Message ${msg.uid} already marked as seen, skipping`)
              continue
            }

            const parsed: ParsedMail = await simpleParser(msg.source!)

            const ingestion: IngestionObject = {
              metadata: {
                subject: parsed.subject || 'No Subject',
                sender: parsed.from?.text || 'Unknown Sender',
                body: extractBody(parsed),
                timestamp: parsed.date || new Date(),
                id: crypto.randomBytes(16).toString('hex'),
                attachments: await extractAttachments(parsed),
                submission_id: "imap done"
              }

            }
            this.logger.log(`Mail from : ${ingestion.metadata.sender}`)
            const event: Event = {
              id: ingestion.metadata.id,
              message: "IMAP_DONE",
              data: ingestion
            }

            await kafkaService.publishMessage('event.pipeline', event)
            await kafkaService.publishMessage('submission.found', ingestion)
            await redis.set(`redis:status:${ingestion.metadata.id}`, JSON.stringify(event))
            this.logger.log(`Published message`)
            processedUids.push(msg.uid)
            processedCount++

          } catch (msgError) {
            this.logger.error(`Error processing message ${msg.uid}:`, msgError)
          }
        }
      }

      if (processedUids.length > 0) {
        await this.markMessagesAsSeen(client, processedUids)
      }

    } catch (error) {
      this.logger.error('Error during message processing:', error)
      if (processedUids.length > 0) {
        try {
          await this.markMessagesAsSeen(client, processedUids)
        } catch (flagError) {
          this.logger.error('Failed to mark messages as seen:', flagError)
        }
      }
      throw error
    }

    return processedCount
  }

  /**
   * Marks specified messages as seen in the mailbox.
   *
   * Responsibilities:
   * - Adds the '\\Seen' flag to processed messages.
   * - Handles both single and batch updates.
   * - Provides fallback for marking individual messages if batch fails.
   * - Logs success and error details for each operation.
   *
   * @param {ImapFlow} client - IMAP client instance.
   * @param {number[]} uids - Array of message UIDs to mark as seen.
   * @returns {Promise<void>} Resolves when all messages are marked.
   */
  private async markMessagesAsSeen(client: ImapFlow, uids: number[]): Promise<void> {
    try {
      if (uids.length === 1) {
        await client.messageFlagsAdd({ uid: uids[0] }, ['\\Seen'])
        this.logger.debug(`Marked message ${uids[0]} as seen`)
      } else {
        const uidString = uids.join(',')
        await client.messageFlagsAdd({ uid: uidString }, ['\\Seen'])
        this.logger.debug(`Marked ${uids.length} messages as seen`)
      }

      await client.idle() // Brief idle to let server sync
      // await client.idleDone

    } catch (error) {
      this.logger.error('Failed to mark messages as seen:', error)

      for (const uid of uids) {
        try {
          await client.messageFlagsAdd({ uid }, ['\\Seen'])
          this.logger.debug(`Fallback: Marked message ${uid} as seen`)
        } catch (individualError) {
          this.logger.error(`Failed to mark message ${uid} as seen:`, individualError)
        }
      }
    }
  }

  /**
   * Manually triggers the IMAP polling process.
   *
   * Responsibilities:
   * - Invokes the scheduled polling logic on demand.
   * - Useful for manual or API-triggered mailbox checks.
   *
   * @returns {Promise<void>} Resolves when manual polling is complete.
   */
  async manualPoll(): Promise<void> {
    this.logger.log('Manual polling triggered')
    await this.handleCron()
  }

  /**
   * Checks the health of the IMAP connection.
   *
   * Responsibilities:
   * - Attempts to connect and open the mailbox.
   * - Logs and returns connection status.
   *
   * @returns {Promise<boolean>} True if connection is healthy, false otherwise.
   */
  async checkConnection(): Promise<boolean> {
    const client = new ImapFlow({
      host: process.env.IMAP_SERVER!,
      port: 993,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
      logger: false,
    })

    try {
      await client.connect()
      await client.mailboxOpen('INBOX')
      await client.logout()
      return true
    } catch (error) {
      this.logger.error('Connection health check failed:', error)
      return false
    }
  }
}