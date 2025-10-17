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
export async function generateContent(prompt: string) {
    const genAI = new GoogleGenAI({});
    const res = genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    })

    return res;
}

/**
 * 
 * @param {string} documentText 
 * @returns {string} prompt - The final prompt with guidelines. 
 */
export function buildClassificationPrompt(documentText: string) {
    const baseInstruction =
        process.env.DOC_PROMPT_INSTRUCTION ||
        "You are an expert AI document classifier.";

    const categoriesEnv =
        process.env.DOC_PROMPT_CATEGORIES ||
        '["invoice", "receipt", "contract", "id_card", "resume"]';

    const examples =
        process.env.DOC_PROMPT_EXAMPLES ||
        "invoice: billing info; receipt: items purchased; contract: legal terms; id_card: personal ID; resume: professional background.";

    let categories: string[];
    try {
        categories = JSON.parse(categoriesEnv);
    } catch {
        throw new Error("Invalid DOC_PROMPT_CATEGORIES JSON in environment");
    }

    return `
${baseInstruction}

Analyze the document below and classify it into **one of the following categories**:
${categories.map((c) => `- ${c}`).join("\n")}

**Guidelines:**
1. Use textual cues, layout structure, and entities to determine the document type.
2. If uncertain, choose the closest matching category based on meaning.
3. Never invent categories not listed above.
4. Use examples for reference:
   ${examples}

**Response format (strict JSON):**
{
  "type": "<one of ${categories.join(" | ")}>",
  "confidence": <float between 0 and 1>
}

Document:
"""
${documentText}
"""
  `;
}
