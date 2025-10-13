/**
 * Lambda module configuration.
 *
 * Responsibilities:
 * - Registers scheduled tasks using NestJS ScheduleModule.
 * - Provides LambdaService for IMAP polling and event processing.
 * - Provides CloudinaryService for media handling.
 *
 * Industry-standard practices:
 * - Uses modular architecture for separation of concerns.
 * - Ensures services are injectable and reusable.
 */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LambdaService } from './lambda.service';
import { CloudinaryService } from '../helpers/cloudinary.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), 
  ],
  providers: [LambdaService, CloudinaryService],
})
export class LambdaModule {}
