import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const response = await fetch('http://127.0.0.1:8000/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to render page');
    }

    const data = await response.json();
    return NextResponse.json({ content: data.content });
  } catch (error) {
    console.error('Browser render error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to render page' },
      { status: 500 }
    );
  }
}
