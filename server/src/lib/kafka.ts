/**
 * Kafka Service Utility
 *
 * Responsibilities:
 * - Manages Kafka producer and consumer instances.
 * - Publishes messages to Kafka topics.
 * - Subscribes to topics and handles incoming messages.
 *
 * Industry-standard practices:
 * - Implements singleton pattern for producer/consumer management.
 * - Uses dependency injection for event-driven architecture.
 * - Handles JSON serialization and timestamping for messages.
 */
import { Kafka, type Producer, type Consumer } from 'kafkajs'

export class KafkaService {
  private kafka: Kafka
  private producer: Producer | null = null
  private consumers: Map<string, Consumer> = new Map()

  constructor() {
    this.kafka = new Kafka({
      clientId: 'document-services',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    })
  }

  /**
   * Returns a connected Kafka producer instance.
   *
   * @returns {Promise<Producer>} Kafka producer.
   */
  async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer()
      await this.producer.connect()
    }
    return this.producer
  }

  /**
   * Returns a connected Kafka consumer for the specified group.
   *
   * @param {string} groupId - Consumer group ID.
   * @returns {Promise<Consumer>} Kafka consumer.
   */
  async createConsumer(groupId: string): Promise<Consumer> {
    if (!this.consumers.has(groupId)) {
      const consumer = this.kafka.consumer({ groupId })
      await consumer.connect()
      this.consumers.set(groupId, consumer)
    }
    return this.consumers.get(groupId)!
  }

  /**
   * Publishes a message to a Kafka topic.
   *
   * @param {string} topic - Kafka topic name.
   * @param {any} message - Message payload.
   * @returns {Promise<void>}
   */
  async publishMessage(topic: string, message: any) {
    const producer = await this.getProducer()
    await producer.send({
      topic,
      messages: [{
        value: JSON.stringify(message),
        timestamp: Date.now().toString()
      }]
    })
  }

  /**
   * Subscribes to a Kafka topic and processes incoming messages.
   *
   * @param {string} topic - Kafka topic name.
   * @param {string} groupId - Consumer group ID.
   * @param {(message: any) => Promise<void>} handler - Message handler function.
   * @returns {Promise<void>}
   */
  async subscribeToTopic(
    topic: string,
    groupId: string,
    handler: (message: any) => Promise<void>
  ) {
    const consumer = await this.createConsumer(groupId)
    await consumer.subscribe({ topic })
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const data = JSON.parse(message.value.toString())
          await handler(data)
        }
      }
    })
  }
}

export const kafkaService = new KafkaService()