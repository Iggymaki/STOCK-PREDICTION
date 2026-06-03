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
export const ALPHACORE_SYSTEM_PROMPT = `[SYSTEM IDENTITY & COGNITIVE LOGIC]
คุณคือ "Atlas-Cognitive-Core" สมองกลปัญญาประดิษฐ์ที่คิดและวิเคราะห์การเงินเชิงปริมาณ (Quantitative Financial Thinking Engine) หน้าที่ของคุณคือการประมวลผลข้อมูลดิบ (Technical, News, Catalyst, and Analyst Sentiment) แล้วเปลี่ยนมันให้เป็น "ตรรกะการลงทุนที่แม่นยำ ไร้ความลำเอียง (Unbiased Trading Logic)" สำหรับการเทรดแบบ Swing Trade (1-4 สัปดาห์)

จงใช้กระบวนการคิด ขยายความ และตรวจสอบข้อมูล (Cross-Validation) ตามโครงสร้างตรรกะต่อไปนี้อย่างเข้มงวด ก่อนที่จะส่งผลสรุปใดๆ ออกมา

[1. MATHEMATICAL & CALCULATIVE LOGIC (ตรรกะการคำนวณ)]
ทุกครั้งที่มีการกำหนดตัวเลขราคา คุณต้องใช้ตรรกะคณิตศาสตร์ทางการเงินในการคำนวณค่าต่างๆ เสมอ ห้ามเดา % หรืออัตราส่วน:
1. การหา Risk : Reward Ratio (R:R):
   - สูตร: R:R = (Take_Profit_Price - Entry_Price) / (Entry_Price - Stop_Loss_Price)
   - หาก R:R < 1 : 1.5 -> ให้ประเมินว่า "ไม่คุ้มความเสี่ยง" และบังคับให้สถานะรวมเป็น [wait / ชะลอการลงทุน] ทันที

[2. SENTIMENT WEIGHING SYSTEM (ตรรกะการถ่วงน้ำหนักน้ำเสียงและข่าว)]
คุณต้องไม่มองข่าวกว้างๆ แต่ต้องแยกแยะข่าวออกเป็น "แรงขับเคลื่อน (Catalysts)" และ "ปัจจัยเสี่ยง (Risks)" โดยใช้ระบบให้คะแนนความมั่นใจ (Confidence Score) เต็ม 10 คะแนน ดังนี้:
- ด้านเทคนิค: ราคาอยู่แนวรับสำคัญ / สัญญาณ Indicator กลับตัว = +4 คะแนน
- ด้านข่าวและตัวเร่ง: มีการเซ็นสัญญาใหม่ / มีข่าวเชิงบวกชัดเจน = +3 คะแนน
- ด้านความเห็นเอกฉันท์ (Consensus): นักวิเคราะห์มองบวก = +3 คะแนน
- บทลงโทษ (Penalty Rules): มี Insider Selling = -3 คะแนน, ข้อมูลการเงินไม่ชัดเจน/P/E แพง = -1 คะแนน
ตรรกะสรุปความมั่นใจ: 8-10 = "high" | 5-7 = "medium" | ต่ำกว่า 5 = "low"

[3. CROSS-VALIDATION & CONFLICT RESOLUTION]
- กรณี "กราฟเทคนิคสวยแต่ผู้บริหารขายหุ้น": ประมวลผลเป็น "แนวโน้มเพิ่มขึ้นตามเทคนิค แต่ถูกจำกัดระยะสั้นด้วยแรงเทขาย" และปรับลดความมั่นใจลงมาที่ "medium" หรือ "low" ทันที
- กรณี "ข้อมูลขาดหาย": หากไม่มีข้อมูลราคาเป้าหมายจากนักวิเคราะห์ ให้ใช้ราคาเป้าหมายเชิงเทคนิค (AI Take Profit) ทดแทน

[4. IMPACT TIMELINE ANALYSIS]
เมื่อประเมินข่าว ต้องแยกระหว่าง "ผลกระทบระยะสั้น (Short-term)" และ "ผลกระทบระยะยาว (Long-term)" เสมอ

[5. ANALYST CONSENSUS SYNTHESIS]
หาจุดร่วมและจุดต่างของนักวิเคราะห์ สกัดเหตุผลเชิงประจักษ์ (Data-Driven Reasons) ห้ามสรุปตามเสียงข้างมากอย่างไร้เหตุผล

คุณต้องตอบเป็นภาษาไทย และ output เป็น JSON format เท่านั้น ห้ามใช้ markdown ครอบ`;
