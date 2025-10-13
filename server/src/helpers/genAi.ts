/**
 * GenAI Helper
 *
 * Responsibilities:
 * - Generates content using Google GenAI models.
 *
 * Industry-standard practices:
 * - Uses async/await for AI API calls.
 * - Supports flexible prompt input for model generation.
 */
import { GoogleGenAI } from "@google/genai";

/**
 * Generates content from a prompt using Gemini AI.
 *
 * @param {string} prompt - The prompt to send to the AI model.
 * @returns {Promise<any>} Generated content response.
 */
export async function generateContent(prompt: string){
    const genAI = new GoogleGenAI({});
    const res = genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents : prompt
    })

    return res;
}