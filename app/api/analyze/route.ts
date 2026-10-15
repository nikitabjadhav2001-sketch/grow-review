import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { reviews } = await req.json();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert product intelligence AI for Groww. Analyze user reviews, identify core friction points regarding mutual fund exit loads, transaction processing, and FIFO redemption rules. Provide structured actionable product recommendations.'
          },
          {
            role: 'user',
            content: `Analyze these reviews and provide structured insights:\n${JSON.stringify(reviews.slice(0, 15))}`
          }
        ],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message || 'OpenRouter API Error' }, { status: 500 });
    }

    const analysisText = data.choices?.[0]?.message?.content || 'No insights generated.';

    return NextResponse.json({ analysis: analysisText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}