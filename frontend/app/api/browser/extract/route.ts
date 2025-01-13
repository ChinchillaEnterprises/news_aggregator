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

    const response = await fetch('http://127.0.0.1:8000/extract', {
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
    // Pass through just the final result
    return NextResponse.json({ result: data.result || null });
  } catch (error) {
    console.error('Data extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract data' },
      { status: 500 }
    );
  }
}
