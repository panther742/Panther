import { GoogleGenAI, Type } from '@google/genai';
import { localScriptConvert } from '../utils/localScriptConverter';
import {
  ScriptConversionMode,
  ScriptConverterRequest,
  ScriptConverterResponse,
} from '../types';

export type { ScriptConverterRequest, ScriptConverterResponse };

// Local smart dictionary & transliteration rules for bulletproof offline fallback

export async function convertScriptWithAI(
  req: ScriptConverterRequest,
  apiKey?: string
): Promise<ScriptConverterResponse> {
  const { sourceText, sourceLang = 'auto', targetLang, mode, designerMode = true, quickFixAction } = req;
  const keyToUse = apiKey || process.env.GEMINI_API_KEY;

  if (!keyToUse) {
    console.warn('[ScriptConverter] GEMINI_API_KEY missing. Using client fallback generator.');
    return localScriptConvert(req);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: keyToUse,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const systemInstruction = `You are Panther Studio's world-class AI Script Converter, specially engineered for Graphic Designers, Branding Agencies, Typography Experts, and Signage Creators.

YOUR STRICTEST MANDATE:
1. "smart-brand" mode (Smart Brand Mode):
   - NEVER translate brand names, titles, shop names, or creative English phrases into literal dictionary translations!
   - MUST preserve the phonetic pronunciation and brand identity, written in the target language's native script.
   - EXAMPLES:
     - "Panther Studio" in Hindi -> "पैंथर स्टूडियो" (STRICTLY NOT "तेंदुआ स्टूडियो")
     - "Coffee House" in Hindi -> "कॉफी हाउस" (STRICTLY NOT "कॉفی का घर")
     - "Royal Fashion" in Hindi -> "रॉयल फैशन" (STRICTLY NOT "शाही फैशन")
     - "Black Panther" in Hindi -> "ब्लैक पैंथर" (STRICTLY NOT "काला तेंदुआ")
     - "Graphic Designer" in Hindi -> "ग्राफिक डिज़ाइनर"
     - "Panther Studio" in Gujarati -> "પેંથર સ્ટુડિયો"
     - "Coffee House" in Gujarati -> "કોફી હાઉસ"
2. "transliteration" mode:
   - Convert phonetics and pronunciation directly into the native script of the target language.
   - EXAMPLES: "Panther Studio" -> "पैंथर स्टूडियो", "Coffee House" -> "कॉफी हाउस".
3. "translation" mode:
   - Translate the actual semantic meaning accurately into natural spoken native language.
   - EXAMPLES: "Good Morning" -> "सुप्रभात", "Welcome" -> "स्वागत है", "Best Graphic Designer" -> "सर्वश्रेष्ठ ग्राफिक डिज़ाइनर".
4. "auto-detect" mode:
   - Analyze if the text is a brand/title or general text. If brand/title, apply Smart Brand phonetic script conversion. If full sentence, translate naturally.

DESIGNER VARIATIONS REQUIREMENT (when designerMode is true):
Provide 8 distinct graphic designer font-ready variations for posters, logos, & thumbnails:
- short: Concise / Punchy version suitable for app icons or compact badges
- premium: Sophisticated phrasing with high-end aesthetic appeal
- luxury: Elegant royal/heritage phrasing or calligraphy-styled formulation
- modern: Trendy, sleek, high-energy modern formulation
- minimal: Ultra-clean, simplified core words only
- poster: Bold, impactful phrasing crafted for large headline posters
- logo: Balanced, symmetrical brand mark formulation
- thumbnail: High contrast, catchy phrasing designed for YouTube/social thumbnails

QUICK FIX ENHANCEMENTS (if quickFixAction is passed):
- grammar: Fix grammar and refine structure
- spelling: Correct spelling mistakes
- smart-rewrite: Make it more engaging & natural
- brand-safe: Ensure brand names are 100% phonetic & protected from literal translation
- poster-safe: Ensure headline punch & zero awkward line breaks
- typography-safe: Ensure proper script glyphs, diacritics, & ligatures

Target Language Code: "${targetLang}".
Source Language Code: "${sourceLang}".
Selected Mode: "${mode}".
Quick Fix Requested: "${quickFixAction || 'none'}".
`;

    const userPrompt = `Convert the following text:
"${sourceText}"

Return a structured JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryOutput: {
              type: Type.STRING,
              description: 'The converted primary text in target native script',
            },
            pronunciationGuide: {
              type: Type.STRING,
              description: 'Phonetic pronunciation guide in Latin/English characters',
            },
            explanation: {
              type: Type.STRING,
              description: 'Brief design note on why this conversion was chosen for graphic designers',
            },
            detectedSourceLang: {
              type: Type.STRING,
              description: 'Name or code of the detected source language',
            },
            designerVariations: {
              type: Type.OBJECT,
              properties: {
                short: { type: Type.STRING },
                premium: { type: Type.STRING },
                luxury: { type: Type.STRING },
                modern: { type: Type.STRING },
                minimal: { type: Type.STRING },
                poster: { type: Type.STRING },
                logo: { type: Type.STRING },
                thumbnail: { type: Type.STRING },
              },
              required: ['short', 'premium', 'luxury', 'modern', 'minimal', 'poster', 'logo', 'thumbnail'],
            },
          },
          required: ['primaryOutput', 'pronunciationGuide', 'explanation', 'designerVariations'],
        },
      },
    });

    const textResult = response.text;
    if (textResult) {
      const parsed = JSON.parse(textResult) as ScriptConverterResponse;
      if (parsed.primaryOutput) {
        return parsed;
      }
    }
  } catch (error: any) {
    console.error('[ScriptConverter API Error]:', error?.message || error);
  }

  // Fallback if AI call fails
  return localScriptConvert(req);
}
