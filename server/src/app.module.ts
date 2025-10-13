import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestionModule } from './ingestion/ingestion.module';
import { OcrModule } from './ocr/ocr.module';
import { ProxyModule } from './proxy/proxy.module';
import { LambdaModule } from './lambda/lambda.module';
import { ClassificationModule } from './classification/classification.module';
import { AnalysisModule } from './analysis/analysis.module';
import { EventPipelineModule } from './event-pipeline/event-pipeline.module';

@Module({
  imports: [IngestionModule, OcrModule, ProxyModule, LambdaModule, ClassificationModule, AnalysisModule, EventPipelineModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
