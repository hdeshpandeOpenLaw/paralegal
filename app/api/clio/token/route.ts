import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CLIO_CLIENT_ID = process.env.NEXT_PUBLIC_CLIO_CLIENT_ID;
const CLIO_CLIENT_SECRET = process.env.CLIO_CLIENT_SECRET;
const CLIO_REDIRECT_URI = process.env.NEXT_PUBLIC_CLIO_REDIRECT_URI;

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    if (CLIO_CLIENT_ID) params.append('client_id', CLIO_CLIENT_ID);
    if (CLIO_CLIENT_SECRET) params.append('client_secret', CLIO_CLIENT_SECRET);
    if (CLIO_REDIRECT_URI) params.append('redirect_uri', CLIO_REDIRECT_URI);

    const response = await fetch('https://app.clio.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Clio token exchange failed:', data);
      return NextResponse.json({ error: 'Failed to fetch access token', details: data.error_description || data.error }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Internal server error in token exchange:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
