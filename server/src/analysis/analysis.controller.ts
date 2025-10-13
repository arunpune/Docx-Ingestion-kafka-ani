import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { AnalysisObject } from 'src/types';

@Controller('analysis')
export class AnalysisController {
    private readonly logger = new Logger(AnalysisController.name);
    @MessagePattern('analysis.init')
    async handle(@Payload() payLoad : AnalysisObject){
        this.logger.log("this is Analysis engine");
    }
}
