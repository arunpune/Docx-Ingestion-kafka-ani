/**
 * Parser Helper
 *
 * Responsibilities:
 * - Extracts plain text body from parsed email messages.
 * - Uploads email attachments to Cloudinary and returns metadata.
 *
 * Industry-standard practices:
 * - Uses environment variables for Cloudinary configuration.
 * - Handles both text and HTML email bodies.
 * - Supports image and raw file uploads with unique naming.
 */
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import { ParsedMail } from "mailparser";
import { Attachment } from "src/types";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the body text from a parsed email message.
 *
 * @param {ParsedMail} msg - Parsed email object.
 * @returns {string} Plain text body.
 */
export function extractBody(msg: ParsedMail): string {
  if (msg.text) {
    return msg.text.trim();
  } else if (msg.html) {
    return msg.html.replace(/<[^>]+>/g, "").trim();
  }
  return "";
}

/**
 * Extracts and uploads attachments from a parsed email message.
 *
 * @param {ParsedMail} msg - Parsed email object.
 * @returns {Promise<Attachment[]>} Array of attachment metadata.
 */
export async function extractAttachments(msg: ParsedMail): Promise<Attachment[]> {
  const attachments: Attachment[] = [];

  if (msg.attachments && msg.attachments.length > 0) {
    for (const part of msg.attachments) {
      const filename = part.filename || "untitled";
      const buffer = part.content as Buffer;

      // Decide Cloudinary resource type
      const isImage = part.contentType.includes("image");
      const resourceType = isImage ? "image" : "raw";

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            use_filename: true,
            unique_filename: false,
            public_id: `emails/${Date.now()}-${filename}`, // prevent collisions
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      attachments.push({
        filename,
        content_type: part.contentType,
        url: uploadResult.secure_url,
      });
    }
  }

  return attachments;
}
