import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateVideoIdeas = async (niche: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `أعطني 5 أفكار فيديوهات إبداعية لمجال: ${niche}. اجعل العناوين جذابة وقدم وصفاً قصيراً لكل فكرة.`,
  });
  return response.text;
};

export const generateScriptOutline = async (title: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `قم بإنشاء مخطط تفصيلي لسكربت فيديو بعنوان: ${title}. قم بتقسيمه إلى مقدمة، نقاط رئيسية، وخاتمة.`,
  });
  return response.text;
};

export const optimizeTitle = async (draftTitle: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `اقترح 3 عناوين جذابة ومحسنة لمحركات البحث (SEO) بناءً على هذا العنوان: ${draftTitle}.`,
  });
  return response.text;
};
