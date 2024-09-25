import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HintType } from "../App";

const API_KEY = "AIzaSyBG8sB9lDLUwKmSGSLLruCz53KkRXVn3fA";
const API_URL = "https://translation.googleapis.com/language/translate/v2";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface TarotResponse {
  analysis: string;
  [key: string]: string;
}

export interface TarotCardExplanation {
  general: string;
  love: string;
  career: string;
  finance: string;
  advice: string;
}
export async function translateText(
  text: string,
  target = "vi"
): Promise<string> {
  try {
    const response = await axios.post(
      API_URL,
      {},
      {
        params: {
          q: text,
          target: target,
          key: API_KEY,
        },
      }
    );
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Lỗi dịch:", error);
    return text;
  }
}

export const cardTalkAboutYou = async (
  cardNames: string[],
  hintOptions: { value: HintType; label: string }[],
  other: string
): Promise<TarotResponse | null> => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Bạn là một chuyên gia Tarot có nhiều năm kinh nghiệm. Hãy phân tích ý nghĩa của các lá bài Tarot sau đây, sử dụng ngôn ngữ và văn phong phù hợp với một chuyên gia Tarot:

    Tên của các lá bài: ${cardNames.join(", ")}(không dịch nghĩa tiếng việt của lá bài) và bạn muốn biết thêm về ${other} 

    Hãy đưa ra một bài phân tích tổng quát về ý nghĩa của các lá bài này khi xuất hiện cùng nhau, đặc biệt là trong các khía cạnh ${
      hintOptions.map(option => option.label).join(", ")
    }.

    Trả về kết quả dưới dạng JSON với cấu trúc sau:
    {
      "analysis": "Phân tích tổng quát",
      ${hintOptions.map(option => option.value === 'other' ? `"${option.value}": "Ý nghĩa cụ thể cho khía cạnh ${other}",` : `"${option.value}": "Ý nghĩa cụ thể cho khía cạnh ${option.label}",`).join("\n      ")}
      "other": "Ý nghĩa cụ thể cho khía cạnh khác ${other}"
    }

    Không thêm chú thích \`\`\`json hay \`\`\` .
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);

    const parsedResult = JSON.parse(text.trim()) as TarotResponse;
    return parsedResult;
  } catch (error) {
    console.error("Lỗi khi phân tích kết quả từ Gemini:", error);
    return null;
  }
};

export const explainTarotCard = async (
  cardName: string
): Promise<TarotCardExplanation | null> => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Bạn là một chuyên gia Tarot có nhiều năm kinh nghiệm. Hãy phân tích ý nghĩa của lá bài Tarot sau đây, sử dụng ngôn ngữ và văn phong phù hợp với một chuyên gia Tarot:

    Tên lá bài: ${cardName} (không dịch nghĩa tiếng việt của lá bài)

    Hãy đưa ra một bài phân tích chi tiết về ý nghĩa của lá bài này, bao gồm:
    1. Ý nghĩa tổng quát
    2. Ý nghĩa trong tình yêu
    3. Ý nghĩa trong sự nghiệp
    4. Ý nghĩa trong tài chính
    5. Lời khuyên

    Trả về kết quả dưới dạng JSON với cấu trúc sau:
    {
      "general": "Ý nghĩa tổng quát",
      "love": "Ý nghĩa trong tình yêu",
      "career": "Ý nghĩa trong sự nghiệp", 
      "finance": "Ý nghĩa trong tài chính",
      "advice": "Lời khuyên của lá bài"
    }

    Không thêm chú thích \`\`\`json hay \`\`\` .
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);

    const parsedResult = JSON.parse(text.trim()) as TarotCardExplanation;
    return parsedResult;
  } catch (error) {
    console.error("Lỗi khi phân tích kết quả từ Gemini:", error);
    return null;
  }
};
