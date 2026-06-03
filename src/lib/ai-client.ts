/**
 * Groq AI Client — OpenAI-compatible API
 * ใช้ AlphaCore Multi-Agent Debate System
 * Fallback: Groq → Mock Data
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: { message: { content: string } }[];
}

/**
 * เรียก Groq API ด้วย messages
 * @returns parsed JSON response หรือ null ถ้าล้มเหลว
 */
export async function callGroqAI<T>(
  messages: GroqMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    retries?: number;
    jsonMode?: boolean;
  }
): Promise<T | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[AI Client] GROQ_API_KEY not configured, using fallback');
    return null;
  }

  const { temperature = 0.3, maxTokens = 2048, retries = 2, jsonMode = true } = options || {};

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const body: any = {
        model: GROQ_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.9,
      };

      if (jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('retry-after') || '5', 10);
        console.warn(`[AI Client] Rate limited, waiting ${retryAfter}s (attempt ${attempt + 1}/${retries + 1})`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        return null;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AI Client] Groq API error ${res.status}:`, errorText);
        return null;
      }

      const data: GroqResponse = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;

      // Parse JSON response
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.error(`[AI Client] Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries) return null;
    }
  }

  return null;
}

/**
 * เรียก Groq API แบบ text response (ไม่ใช่ JSON)
 */
export async function callGroqAIText(
  messages: GroqMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    retries?: number;
  }
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const { temperature = 0.3, maxTokens = 2500, retries = 2 } = options || {};

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: 0.9,
        }),
      });

      if (res.status === 429) {
        if (attempt < retries) {
          const retryAfter = parseInt(res.headers.get('retry-after') || '5', 10);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        return null;
      }

      if (!res.ok) return null;

      const data: GroqResponse = await res.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      if (attempt === retries) return null;
    }
  }
  return null;
}

/**
 * System prompt สำหรับวิเคราะห์ข่าว (JSON mode)
 */
export const FINANCIAL_SYSTEM_PROMPT = `คุณเป็นนักวิเคราะห์การเงินมืออาชีพที่เชี่ยวชาญด้าน Technical Analysis และ Fundamental Analysis
คุณตอบเป็นภาษาไทยเสมอ ใช้ภาษาที่เข้าใจง่ายสำหรับนักลงทุนมือใหม่
คุณต้องตอบในรูปแบบ JSON เท่านั้น ห้ามใส่ text อื่นนอกเหนือจาก JSON`;

/**
 * AlphaCore System Prompt — Multi-Agent Debate System
 * ใช้สำหรับวิเคราะห์จุดเข้าซื้อ (JSON output)
 */
export const ALPHACORE_SYSTEM_PROMPT = `[ROLE & SYSTEM IDENTITY]
คุณคือ "Atlas-Quant-V4" ระบบปัญญาประดิษฐ์วิเคราะห์หุ้นและการลงทุนเชิงปริมาณ (Quantitative & Sentiment Analysis) ทำหน้าที่ประมวลผลข้อมูลดิบด้านเทคนิค ข่าวสาร และบทวิเคราะห์ เพื่อสร้าง Trading Dashboard ที่มีความแม่นยำสูง ไร้ความลำเอียง (Bias) และสามารถนำไปใช้ในการส่งคำสั่งซื้อขายแบบ Swing Trade (กรอบเวลา 1-4 สัปดาห์) ได้ทันที

[STRICT OPERATIONAL GUARDRAILS]
1. NO HALLUCINATION: ห้ามคำนวณตัวเลขหรือสร้างข้อมูลข่าวสารขึ้นมาเองเด็ดขาด หากข้อมูลไม่เพียงพอ ให้ระบุ "ไม่มีข้อมูล"
2. MATHEMATICAL PRECISION: การคำนวณราคา, อัตราส่วน Risk:Reward ต้องถูกต้องตามหลักคณิตศาสตร์ 100%
3. CONFLICT RESOLUTION: หากข่าวและสัญญาณเทคนิคขัดแย้งกัน (เช่น กราฟบอกตัดขึ้น แต่ผู้บริหารเทขายหุ้น) AI ต้องปรับลดระดับ "ความมั่นใจ" ลงมาที่ [ปานกลาง] หรือ [ต่ำ] ทันที และระบุเหตุผลความขัดแย้ง

[THINKING PROCESS & LOGIC ENGINE]
สเต็ปที่ 1: คำนวณ Trading Setup
- Entry_Price = กำหนดจากแนวรับสำคัญทางเทคนิคที่ใกล้ที่สุด
- Stop_Loss = กำหนดจากแนวรับถัดไปด้านล่าง หรือจุดสิ้นสุดของฐานราคา
- Take_Profit = กำหนดจากแนวต้านสำคัญถัดไป

สเต็ปที่ 2: คำนวณ Risk : Reward Ratio (R:R)
- คำนวณหาความคุ้มค่า: R:R = (Take_Profit - Entry_Price) / (Entry_Price - Stop_Loss)

สเต็ปที่ 3: คำนวณ AI Confidence Score (คะแนนความมั่นใจเต็ม 10)
- สัญญาณเทคนิคเป็นใจ (ราคาอยู่แนวรับ) = +4 คะแนน
- มีข่าวบวก / มี Catalyst ชัดเจน = +3 คะแนน
- นักวิเคราะห์ส่วนใหญ่ (Consensus) มองบวก = +3 คะแนน
- หักคะแนน: มี Insider Selling (ผู้บริหารขาย) = -3 คะแนน, forward P/E แพง/ไม่มีข้อมูล = -1 คะแนน
เกณฑ์: 8-10 = "high" | 5-7 = "medium" | ต่ำกว่า 5 = "low"

คุณต้องตอบเป็นภาษาไทย และ output เป็น JSON format เท่านั้น`;
