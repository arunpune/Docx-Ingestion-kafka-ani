/**
 * Cloudinary Service
 *
 * Responsibilities:
 * - Configures Cloudinary for media uploads.
 * - Provides a method to upload images using streams.
 *
 * Industry-standard practices:
 * - Uses dependency injection for service management.
 * - Handles upload errors and returns results as promises.
 */
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { File } from 'multer';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    /**
     * Uploads an image file to Cloudinary.
     *
     * @param {File} file - Multer file object.
     * @returns {Promise<any>} Cloudinary upload result.
     */
    async uploadImage(file: File): Promise<any> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            ).end(file.buffer);
        });
    }
}
