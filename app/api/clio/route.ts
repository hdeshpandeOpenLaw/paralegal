import { NextRequest, NextResponse } from 'next/server';

const CLIO_API_BASE_URL = 'https://app.clio.com/api/v4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Clio-Token",
};

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { endpoint, method = 'GET', body, accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 401, headers: corsHeaders });
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
      return NextResponse.json({ error: 'Clio API request failed', details: data }, { status: response.status, headers: corsHeaders });
    }

    return NextResponse.json(data, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Internal server error in Clio proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500, headers: corsHeaders });
  }
}
