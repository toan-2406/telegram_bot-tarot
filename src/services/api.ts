import axios from "axios";
import { HintType } from "../App";

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = "https://api.deepseek.com/v1/chat/completions";
const TRANSLATE_API_URL = "https://translation.googleapis.com/language/translate/v2";

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
      TRANSLATE_API_URL,
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
  other: string,
  onStream?: (chunk: string) => void
): Promise<TarotResponse | null> => {
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
    }`.trim();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        stream: !!onStream,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    if (onStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                accumulatedText += content;
                onStream(content);
              }
            } catch (e) {
              console.error('Error parsing SSE chunk:', e);
            }
          }
        }
      }

      try {
        const parsedResult = JSON.parse(accumulatedText) as TarotResponse;
        return parsedResult;
      } catch (parseError) {
        console.error("Lỗi khi parse JSON:", parseError);
        const cleanedText = accumulatedText.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanedText) as TarotResponse;
      }
    } else {
      const data = await response.json();
      const text = data.choices[0].message.content.trim();
      
      try {
        const parsedResult = JSON.parse(text) as TarotResponse;
        return parsedResult;
      } catch (parseError) {
        console.error("Lỗi khi parse JSON:", parseError);
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanedText) as TarotResponse;
      }
    }
  } catch (error) {
    console.error("Lỗi khi phân tích kết quả từ Deepseek:", error);
    if (error instanceof Error) {
      console.error("Chi tiết lỗi:", error.message);
    }
    return null;
  }
};

export const explainTarotCard = async (
  cardName: string,
  onStream?: (chunk: string) => void
): Promise<TarotCardExplanation | null> => {
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
    }`.trim();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        stream: !!onStream,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    if (onStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                accumulatedText += content;
                onStream(content);
              }
            } catch (e) {
              console.error('Error parsing SSE chunk:', e);
            }
          }
        }
      }

      try {
        const parsedResult = JSON.parse(accumulatedText) as TarotCardExplanation;
        return parsedResult;
      } catch (parseError) {
        console.error("Lỗi khi parse JSON:", parseError);
        const cleanedText = accumulatedText.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanedText) as TarotCardExplanation;
      }
    } else {
      const data = await response.json();
      const text = data.choices[0].message.content.trim();
      
      try {
        const parsedResult = JSON.parse(text) as TarotCardExplanation;
        return parsedResult;
      } catch (parseError) {
        console.error("Lỗi khi parse JSON:", parseError);
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanedText) as TarotCardExplanation;
      }
    }
  } catch (error) {
    console.error("Lỗi khi phân tích kết quả từ Deepseek:", error);
    if (error instanceof Error) {
      console.error("Chi tiết lỗi:", error.message);
    }
    return null;
  }
};
