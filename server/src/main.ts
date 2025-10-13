import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from "dotenv"
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import dbConnect from './helpers/db';

dotenv.config({
  path : "./.env"
})

/**
 * Bootstraps the NestJS application.
 *
 * Responsibilities:
 * - Initializes the main application module.
 * - Configures logging levels for debugging and monitoring.
 * - Connects to a Kafka microservice for event-driven architecture.
 * - Starts all configured microservices.
 * - Begins listening for HTTP requests on the specified port.
 * - Establishes a connection to the database.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} Resolves when the application is fully started.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
      },
      consumer: {
        groupId: 'ocr-consumer',
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);

  await dbConnect();
}
bootstrap();
