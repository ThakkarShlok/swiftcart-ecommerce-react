// src/api/geminiSdkApi.js
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();

let ai = null;
try {
  if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log('✅ Gemini SDK initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini SDK:', error);
}

const GEMINI_MODEL = 'gemini-2.5-flash';

export const summarizeProductReviews = async (reviews, productName) => {
  if (!reviews || reviews.length < 2) return null;

  if (!GEMINI_API_KEY || !ai) {
    console.error('Gemini SDK not configured. Check VITE_GEMINI_API_KEY in .env');
    return null;
  }

  const validReviews = reviews
    .slice(0, 5)
    .filter(r => r.rating_message && r.rating_message.trim().length > 15);

  if (validReviews.length < 2) return null;

  const reviewsText = validReviews
    .map((r, i) => `${i + 1}. ${r.rating_number || 5} stars - "${r.rating_message.trim().substring(0, 80)}"`)
    .join('\n');

  // Extremely short prompt = fewer output tokens needed = no truncation
  const prompt = `Reviews for "${productName}":
${reviewsText}

Reply with ONLY this JSON, no other text:
{"pros":["one short point"],"cons":[],"sentiment":"positive","summary":"one sentence"}`;

  try {
    console.log('📡 Calling Gemini...');

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.1,
        // ✅ Raised to 1024 — gemini-2.5-flash is a thinking model,
        //    it consumes tokens internally before outputting.
        //    300 was cutting the response mid-sentence.
        maxOutputTokens: 1024,
      },
    });

    let text = response.text;
    console.log('Raw response:', text);

    if (!text || !text.trim()) {
      console.error('Empty response from Gemini');
      return null;
    }

    // Strip markdown fences
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    // Find the JSON block — use a greedy match to get the LAST closing brace
    // so a truncated open string doesn't fool the regex
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      console.error('No complete JSON object in response:', text);
      return null;
    }

    const result = JSON.parse(text.slice(start, end + 1));
    console.log('✅ Parsed:', result);

    return {
      pros: Array.isArray(result.pros) ? result.pros.slice(0, 3) : [],
      cons: Array.isArray(result.cons) ? result.cons.slice(0, 3) : [],
      sentiment: ['positive', 'negative', 'mixed'].includes(result.sentiment)
        ? result.sentiment
        : 'positive',
      summary: result.summary || 'Customers like this product',
    };
  } catch (error) {
    console.error('❌ Gemini error:', error?.message || error);
    return null;
  }
};