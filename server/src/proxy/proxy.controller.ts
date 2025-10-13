/**
 * Proxy Controller
 *
 * Responsibilities:
 * - Exposes an HTTP GET endpoint for retrieving submission status.
 * - Delegates data fetching to the ProxyService.
 * - Logs controller activity for monitoring and debugging.
 *
 * Industry-standard practices:
 * - Uses dependency injection for service management.
 * - Applies RESTful route decorators for endpoint definition.
 */
import { Controller, Get, Logger } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Controller('proxy')
export class ProxyController {

    private readonly logger = new Logger(ProxyController.name)
    constructor(private readonly proxyService : ProxyService){}

    /**
     * Handles GET requests to retrieve submission status.
     *
     * @returns {Promise<any>} Array of submissions with attachments.
     */
    @Get()
    async getStatus(){
        const res = await this.proxyService.handle()
        return res;
    }
}
