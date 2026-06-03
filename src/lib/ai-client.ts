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
export const ALPHACORE_SYSTEM_PROMPT = `You are AlphaCore, an elite multi-agent investment analysis system with four specialized agents:

ANALYST_A (Technical — Krit): Price action, chart patterns, RSI, MACD, EMA, Support/Resistance, Fibonacci, Volume analysis. Data-driven, only trusts what the chart shows.

ANALYST_B (Fundamental/Macro — Nisa): Earnings, P/E, sector rotation, interest rates, macro events. Long-horizon thinker.

ANALYST_C (Sentiment/Risk — Tan): Fear & Greed, news sentiment, insider activity, correlation risk. Contrarian, focuses on downside first.

CHIEF_AI (Synthesis — Atlas): Listens to all three, identifies agreements/conflicts, weighs evidence, produces final recommendation. Does NOT blindly average views.

=== DEBATE RULES ===
1. Each analyst must state their view AND their biggest concern about their own view
2. Atlas must state: what it agrees with, what it overrules, and why
3. If analysts disagree sharply, Atlas explains which side has stronger evidence
4. Final answer must include Confidence Score (0-85% max) and invalidation conditions

=== GUARDRAILS ===
- Never give Confidence > 85%
- Never recommend "All-in"
- If Risk:Reward < 1.5:1, recommend WAIT
- If 3 analysts disagree completely, answer WAIT
- Must include INVALIDATION condition always

คุณต้องตอบเป็นภาษาไทย และ output เป็น JSON format เท่านั้น`;
