import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'No API Key' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      }),
    });

    const remainingRequests = res.headers.get('x-ratelimit-remaining-requests');
    const remainingTokens = res.headers.get('x-ratelimit-remaining-tokens');
    const resetRequests = res.headers.get('x-ratelimit-reset-requests');
    const resetTokens = res.headers.get('x-ratelimit-reset-tokens');

    return NextResponse.json({
      remainingRequests,
      remainingTokens,
      resetRequests,
      resetTokens,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quota' }, { status: 500 });
  }
}
