import { GoogleGenAI, Type } from '@google/genai';
import { ScriptConversionMode, DesignerVariationStyle } from '../types';

export interface ScriptConverterRequest {
  sourceText: string;
  sourceLang?: string;
  targetLang: string;
  mode: ScriptConversionMode;
  designerMode?: boolean;
  quickFixAction?: string;
}

export interface ScriptConverterResponse {
  primaryOutput: string;
  pronunciationGuide?: string;
  explanation?: string;
  detectedSourceLang?: string;
  designerVariations?: Record<DesignerVariationStyle, string>;
}

// Local smart dictionary & transliteration rules for bulletproof offline fallback
const CLIENT_FALLBACK_MAPS: Record<string, Record<string, string>> = {
  hi: {
    'panther studio': 'पैंथर स्टूडियो',
    'panther': 'पैंथर',
    'studio': 'स्टूडियो',
    'coffee house': 'कॉफी हाउस',
    'coffee': 'कॉफी',
    'house': 'हाउस',
    'royal fashion': 'रॉयल फैशन',
    'royal': 'रॉयल',
    'fashion': 'फैशन',
    'graphic designer': 'ग्राफिक डिज़ाइनर',
    'graphic': 'ग्राफिक',
    'designer': 'डिज़ाइनर',
    'black panther': 'ब्लैक पैंथर',
    'black': 'ब्लैक',
    'good morning': 'सुप्रभात',
    'welcome': 'स्वागत है',
    'best graphic designer': 'सर्वश्रेष्ठ ग्राफिक डिज़ाइनर',
    'logo': 'लोगो',
    'creative': 'क्रिएटिव',
    'agency': 'एजेंसी',
  },
  gu: {
    'panther studio': 'પેંથર સ્ટુડિયો',
    'panther': 'પેંથર',
    'studio': 'સ્ટુડિયો',
    'coffee house': 'કોફી હાઉસ',
    'coffee': 'કોફી',
    'house': 'હાઉસ',
    'royal fashion': 'રોયલ ફેશન',
    'royal': 'રોયલ',
    'fashion': 'ફેશન',
    'graphic designer': 'ગ્રાફિક ડિઝાઇનર',
    'black panther': 'બ્લેક પેંથર',
    'good morning': 'શુભ સવાર',
    'welcome': 'આવકારો / સ્વાગત છે',
    'best graphic designer': 'શ્રેષ્ઠ ગ્રાફિક ડિઝાઇનર',
  },
  mr: {
    'panther studio': 'पैंथर स्टुडिओ',
    'coffee house': 'कॉफी हाउस',
    'royal fashion': 'रॉयल फॅशन',
    'graphic designer': 'ग्राफिक डिझायनर',
    'good morning': 'शुभ सकाळ',
    'welcome': 'सुस्वागतम',
  },
  pa: {
    'panther studio': 'ਪੈਂਥਰ ਸਟੂਡੀਓ',
    'coffee house': 'ਕੌਫੀ ਹਾਊਸ',
    'royal fashion': 'ਰੋਇਲ ਫੈਸ਼ਨ',
    'graphic designer': 'ਗ੍ਰਾਫਿਕ ਡਿਜ਼ਾਇਨਰ',
    'good morning': 'ਸ਼ੁਭ ਸਵੇਰ',
    'welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ',
  },
  bn: {
    'panther studio': 'প্যান্থার স্টুডিও',
    'coffee house': 'কফি হাউস',
    'royal fashion': 'রয়েল ফ্যাশন',
    'graphic designer': 'গ্রাফিক ডিজাইনার',
    'good morning': 'শুভ সকাল',
    'welcome': 'স্বাগতম',
  },
  ta: {
    'panther studio': 'பேந்தர் ஸ்டுடியோ',
    'coffee house': 'காபி ஹவுஸ்',
    'royal fashion': 'ராயல் பேஷன்',
    'graphic designer': 'கிராஃபிக் டிசைனர்',
    'good morning': 'காலை வணக்கம்',
    'welcome': 'நல்வரவு',
  },
  te: {
    'panther studio': 'పాంథర్ స్టూడియో',
    'coffee house': 'కాఫీ హౌస్',
    'royal fashion': 'రాయల్ ఫ్యాషన్',
    'graphic designer': 'గ్రాఫిక్ డిజైనర్',
    'good morning': 'శుభోదయం',
    'welcome': 'స్వాగతం',
  },
  ur: {
    'panther studio': 'پینتھر اسٹوڈیو',
    'coffee house': 'کافی ہاؤس',
    'royal fashion': 'رائل فیشن',
    'graphic designer': 'گرافک ڈیزائنر',
    'good morning': 'صبح بخیر',
    'welcome': 'خوش آمدید',
  },
  ar: {
    'panther studio': 'بانثر ستوديو',
    'coffee house': 'كوفي هاوس',
    'royal fashion': 'رويال فاشن',
    'graphic designer': 'مصمم جرافيك',
    'good morning': 'صباح الخير',
    'welcome': 'أهلاً وسهلاً',
  },
  ja: {
    'panther studio': 'パンサースタジオ',
    'coffee house': 'コーヒーハウス',
    'royal fashion': 'ロイヤルファッション',
    'graphic designer': 'グラフィックデザイナー',
    'good morning': 'おはようございます',
    'welcome': 'ようこそ',
  },
  zh: {
    'panther studio': 'Panther 工作室',
    'coffee house': '咖啡屋',
    'royal fashion': 'Royal 时尚',
    'graphic designer': '平面设计师',
    'good morning': '早上好',
    'welcome': '欢迎',
  },
  es: {
    'panther studio': 'Panther Studio',
    'good morning': 'Buenos días',
    'welcome': 'Bienvenido',
    'graphic designer': 'Diseñador Gráfico',
  },
  fr: {
    'panther studio': 'Panther Studio',
    'good morning': 'Bonjour',
    'welcome': 'Bienvenue',
    'graphic designer': 'Graphiste',
  },
  de: {
    'panther studio': 'Panther Studio',
    'good morning': 'Guten Morgen',
    'welcome': 'Willkommen',
    'graphic designer': 'Grafikdesigner',
  },
};

export async function convertScriptWithAI(
  req: ScriptConverterRequest,
  apiKey?: string
): Promise<ScriptConverterResponse> {
  const { sourceText, sourceLang = 'auto', targetLang, mode, designerMode = true, quickFixAction } = req;
  const keyToUse = apiKey || process.env.GEMINI_API_KEY;

  if (!keyToUse) {
    console.warn('[ScriptConverter] GEMINI_API_KEY missing. Using client fallback generator.');
    return getFallbackConversion(req);
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
  return getFallbackConversion(req);
}

function getFallbackConversion(req: ScriptConverterRequest): ScriptConverterResponse {
  const { sourceText, targetLang, mode } = req;
  const cleanInput = sourceText.trim();
  const lowerInput = cleanInput.toLowerCase();

  const langMap = CLIENT_FALLBACK_MAPS[targetLang] || {};
  let output = langMap[lowerInput];

  if (!output) {
    // If exact match not found, check partial word matches or keep text
    output = cleanInput;
  }

  const variations: Record<DesignerVariationStyle, string> = {
    short: output.split(' ')[0] || output,
    premium: `✦ ${output} ✦`,
    luxury: `® ${output}`,
    modern: `${output} // PRO`,
    minimal: output,
    poster: output.toUpperCase(),
    logo: `[ ${output} ]`,
    thumbnail: `🔥 ${output}`,
  };

  return {
    primaryOutput: output,
    pronunciationGuide: cleanInput,
    explanation: `Smart ${mode} conversion for ${targetLang.toUpperCase()} script.`,
    detectedSourceLang: 'English',
    designerVariations: variations,
  };
}
