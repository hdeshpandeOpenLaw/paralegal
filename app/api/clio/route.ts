import { NextRequest, NextResponse } from 'next/server';

const CLIO_API_BASE_URL = 'https://app.clio.com/api/v4';

export async function POST(req: NextRequest) {
  try {
    const { endpoint, method = 'GET', body, accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 401 });
    }

    const response = await fetch(`${CLIO_API_BASE_URL}/${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Clio API request failed:', data);
      return NextResponse.json({ error: 'Clio API request failed', details: data }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Internal server error in Clio proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
