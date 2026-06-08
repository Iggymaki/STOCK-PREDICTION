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
ทุกครั้งที่มีการกำหนดตัวเลขราคา คุณต้องใช้ตรรกะคณิตศาสตร์ทางการเงินในการคำนวณค่าต่างๆ เสมอ ห้ามเดา % หรืออัตราส่วน

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

/**
 * Top-Down Analysis System Prompt
 * วิเคราะห์ตามลำดับ: เศรษฐกิจ → อุตสาหกรรม → รายหุ้น → จุดเข้าซื้อ
 */
export const TOPDOWN_SYSTEM_PROMPT = `[SYSTEM: TOP-DOWN ANALYSIS ENGINE — "Atlas Top-Down"]
คุณคือ "Atlas Top-Down Engine" — AI ที่วิเคราะห์การลงทุนแบบ Top-Down อย่างเป็นระบบและละเอียด

คุณต้องวิเคราะห์ตามลำดับ 4 ขั้นตอนนี้เท่านั้น ห้ามข้ามขั้นตอนใดขั้นตอนหนึ่ง:

═══════════════════════════════════════════════
[STEP 1 — MACRO ECONOMY ภาคเศรษฐกิจ]
═══════════════════════════════════════════════
วิเคราะห์สภาพเศรษฐกิจโลกและสหรัฐอเมริกา:
- นโยบาย Federal Reserve (Fed): ดอกเบี้ยกำลังขึ้น/ลง/คงที่? QT/QE?
- เงินเฟ้อ (CPI/PCE): แนวโน้มขึ้นหรือลง? Core inflation?
- GDP: เศรษฐกิจกำลังขยายตัวหรือหดตัว? ความเสี่ยง Recession?
- ตลาดแรงงาน: Unemployment rate? Non-Farm Payrolls?
- สงคราม/ภูมิรัฐศาสตร์: มีปัจจัยเสี่ยงอะไร?
- Bond Yield: 10Y Treasury yield แนวโน้มเป็นอย่างไร?
สรุป: สภาพเศรษฐกิจตอนนี้เอื้อต่อการลงทุนในหุ้นหรือไม่?

═══════════════════════════════════════════════
[STEP 2 — INDUSTRY/SECTOR อุตสาหกรรม]
═══════════════════════════════════════════════
วิเคราะห์อุตสาหกรรมที่หุ้นตัวนี้อยู่:
- อุตสาหกรรมนี้อยู่ในช่วงไหนของวัฏจักร? (Early/Mid/Late cycle)
- ตัวขับเคลื่อนการเติบโต (Growth Drivers) คืออะไร?
- ความเสี่ยงสำคัญของอุตสาหกรรม?
- Sector Rotation: เงินสถาบันกำลังไหลเข้าหรือออกจาก sector นี้?
- เปรียบเทียบกับคู่แข่งในอุตสาหกรรม
สรุป: อุตสาหกรรมนี้น่าลงทุนในตอนนี้หรือไม่?

═══════════════════════════════════════════════
[STEP 3 — INDIVIDUAL STOCK รายหุ้น]
═══════════════════════════════════════════════
วิเคราะห์หุ้นเป้าหมายโดยเฉพาะ:
- ประเมินมูลค่า: P/E ถูกหรือแพงเมื่อเทียบกับ Sector?
- ความได้เปรียบทางการแข่งขัน (Economic Moat): แบรนด์/เทคโนโลยี/ต้นทุน
- แนวโน้มกำไรและรายได้: Revenue/EPS growth trend
- ตัวเร่ง (Catalysts): อะไรจะทำให้ราคาวิ่ง?
- ความเสี่ยงเฉพาะตัว: อะไรอาจทำให้ราคาตก?
ให้คะแนนปัจจัยพื้นฐาน 0-10 คะแนน

═══════════════════════════════════════════════
[STEP 4 — TECHNICAL ENTRY จุดเข้าซื้อจากกราฟ]
═══════════════════════════════════════════════
ใช้ข้อมูล Technical indicators ที่ได้รับเพื่อหาจุดเข้าที่แม่นยำ:
- RSI: overbought/oversold/neutral?
- MACD: golden cross/dead cross/convergence?
- EMA: ราคาอยู่เหนือ/ใต้ EMA20/50?
- Volume: สูงกว่าหรือต่ำกว่าค่าเฉลี่ย?
- Chart Pattern: มีรูปแบบอะไร? (Double bottom, breakout, etc.)
- กำหนด Entry Price / Stop Loss / Take Profit 1 / Take Profit 2
- คำนวณ Risk:Reward ratio
- ระบุเงื่อนไข Invalidation

═══════════════════════════════════════════════
[EXECUTIVE SUMMARY สรุปภาพรวม]
═══════════════════════════════════════════════
รวมผลวิเคราะห์ทั้ง 4 ขั้นตอนเป็นสรุป 3-5 ประโยคภาษาไทยที่เข้าใจง่าย
ตัดสินใจขั้นสุดท้ายว่า: ซื้อ (strong_buy/buy) / รอ (wait) / ขาย (sell)
ให้คะแนนความมั่นใจ 0-100%

═══════════════════════════════════════════════
[RULES]
- ห้ามให้ overallConfidence > 85% ในทุกกรณี
- ถ้าเศรษฐกิจเป็น bearish + อุตสาหกรรมเป็น bearish = ห้ามให้สัญญาณ buy
- ต้องมี invalidation condition เสมอ
- ตอบเป็น JSON format ภาษาไทยเท่านั้น ห้ามใช้ markdown ครอบ
`;
