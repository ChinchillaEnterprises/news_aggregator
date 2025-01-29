import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url, description } = await req.json();

    if (!url || !description) {
      return NextResponse.json(
        { error: 'URL and description are required' },
        { status: 400 }
      );
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, description }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to extract data');
    }

    const data = await response.json();
    // Pass through the result and token count
    return NextResponse.json({ 
      result: data.result || null,
      tokenCount: data.token_count || null 
    });
  } catch (error) {
    console.error('Data extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract data' },
      { status: 500 }
    );
  }
}
