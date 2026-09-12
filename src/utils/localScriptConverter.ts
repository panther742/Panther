/**
 * Panther Studio — offline script conversion (shared).
 *
 * Used by BOTH the server (src/server/scriptConverterService.ts) and the
 * browser standalone mode (ScriptStudio), so the tool produces a real
 * script conversion even with no backend / no API key / no internet.
 */
import { ScriptConverterRequest, ScriptConverterResponse, DesignerVariationStyle } from '../types';

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
    'hello': 'नमस्ते',
    'thank you': 'धन्यवाद',
    'good': 'अच्छा',
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
    'hello': 'નમસ્તે',
    'thank you': 'આભાર',
    'good': 'સારું',
  },
  mr: {
    'panther studio': 'पैंथर स्टुडिओ',
    'coffee house': 'कॉफी हाउस',
    'royal fashion': 'रॉयल फॅशन',
    'graphic designer': 'ग्राफिक डिझायनर',
    'good morning': 'शुभ सकाळ',
    'welcome': 'सुस्वागतम',
    'hello': 'नमस्कार',
    'thank you': 'धन्यवाद',
    'good': 'चांगले',
  },
  pa: {
    'panther studio': 'ਪੈਂਥਰ ਸਟੂਡੀਓ',
    'coffee house': 'ਕੌਫੀ ਹਾਊਸ',
    'royal fashion': 'ਰੋਇਲ ਫੈਸ਼ਨ',
    'graphic designer': 'ਗ੍ਰਾਫਿਕ ਡਿਜ਼ਾਇਨਰ',
    'good morning': 'ਸ਼ੁਭ ਸਵੇਰ',
    'welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ',
    'hello': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    'thank you': 'ਧੰਨਵਾਦ',
    'good': 'ਚੰਗਾ',
  },
  bn: {
    'panther studio': 'প্যান্থার স্টুডিও',
    'coffee house': 'কফি হাউস',
    'royal fashion': 'রয়েল ফ্যাশন',
    'graphic designer': 'গ্রাফিক ডিজাইনার',
    'good morning': 'শুভ সকাল',
    'welcome': 'স্বাগতম',
    'hello': 'নমস্কার',
    'thank you': 'ধন্যবাদ',
    'good': 'ভালো',
  },
  ta: {
    'panther studio': 'பேந்தர் ஸ்டுடியோ',
    'coffee house': 'காபி ஹவுஸ்',
    'royal fashion': 'ராயல் பேஷன்',
    'graphic designer': 'கிராஃபிக் டிசைனர்',
    'good morning': 'காலை வணக்கம்',
    'welcome': 'நல்வரவு',
    'hello': 'வணக்கம்',
    'thank you': 'நன்றி',
    'good': 'நல்ல',
  },
  te: {
    'panther studio': 'పాంథర్ స్టూడియో',
    'coffee house': 'కాఫీ హౌస్',
    'royal fashion': 'రాయల్ ఫ్యాషన్',
    'graphic designer': 'గ్రాఫిక్ డిజైనర్',
    'good morning': 'శుభోదయం',
    'welcome': 'స్వాగతం',
    'hello': 'నమస్కారం',
    'thank you': 'ధన్యవాదాలు',
    'good': 'మంచి',
  },
  ur: {
    'panther studio': 'پینتھر اسٹوڈیو',
    'coffee house': 'کافی ہاؤس',
    'royal fashion': 'رائل فیشن',
    'graphic designer': 'گرافک ڈیزائنر',
    'good morning': 'صبح بخیر',
    'welcome': 'خوش آمدید',
    'hello': 'السلام علیکم',
    'thank you': 'شکریہ',
    'good': 'اچھا',
  },
  ar: {
    'panther studio': 'بانثر ستوديو',
    'coffee house': 'كوفي هاوس',
    'royal fashion': 'رويال فاشن',
    'graphic designer': 'مصمم جرافيك',
    'good morning': 'صباح الخير',
    'welcome': 'أهلاً وسهلاً',
    'hello': 'مرحبا',
    'thank you': 'شكرا',
    'good': 'جيد',
  },
  ja: {
    'panther studio': 'パンサースタジオ',
    'coffee house': 'コーヒーハウス',
    'royal fashion': 'ロイヤルファッション',
    'graphic designer': 'グラフィックデザイナー',
    'good morning': 'おはようございます',
    'welcome': 'ようこそ',
    'hello': 'こんにちは',
    'thank you': 'ありがとう',
    'good': '良い',
  },
  zh: {
    'panther studio': 'Panther 工作室',
    'coffee house': '咖啡屋',
    'royal fashion': 'Royal 时尚',
    'graphic designer': '平面设计师',
    'good morning': '早上好',
    'welcome': '欢迎',
    'hello': '你好',
    'thank you': '谢谢',
    'good': '好',
  },
  es: {
    'panther studio': 'Panther Studio',
    'good morning': 'Buenos días',
    'welcome': 'Bienvenido',
    'graphic designer': 'Diseñador Gráfico',
    'hello': 'Hola',
    'thank you': 'Gracias',
    'good': 'Bueno',
  },
  fr: {
    'panther studio': 'Panther Studio',
    'good morning': 'Bonjour',
    'welcome': 'Bienvenue',
    'graphic designer': 'Graphiste',
    'hello': 'Bonjour',
    'thank you': 'Merci',
    'good': 'Bon',
  },
  de: {
    'panther studio': 'Panther Studio',
    'good morning': 'Guten Morgen',
    'welcome': 'Willkommen',
    'graphic designer': 'Grafikdesigner',
    'hello': 'Hallo',
    'thank you': 'Danke',
    'good': 'Gut',
  },
};

export function localScriptConvert(req: ScriptConverterRequest): ScriptConverterResponse {
  const { sourceText, targetLang, mode } = req;
  const cleanInput = sourceText.trim();
  const lowerInput = cleanInput.toLowerCase();

  const langMap = CLIENT_FALLBACK_MAPS[targetLang] || {};

  // Exact match first, then phrase-by-phrase replacement (longest phrases
  // first so "panther studio" wins over "panther"/"studio").
  let output = langMap[lowerInput];
  if (!output) {
    const phrases = Object.keys(langMap).sort((a, b) => b.length - a.length);
    const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const combined = new RegExp(escaped.join('|'), 'gi');
    output = cleanInput.replace(combined, (match) => langMap[match.toLowerCase()] || match);
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
    explanation: `Smart ${mode} conversion for ${targetLang.toUpperCase()} script (offline dictionary).`,
    detectedSourceLang: 'English',
    designerVariations: variations,
  };
}
