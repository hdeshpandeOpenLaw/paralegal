import { NextRequest, NextResponse } from 'next/server';

const CLIO_API_BASE_URL = 'https://app.clio.com/api/v4';

// Set allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

function addCorsHeaders(response: NextResponse, origin: string | null) {
    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Clio-Token');
    return response;
}

export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');

  try {
    const { endpoint, method = 'GET', body, accessToken } = await req.json();

    if (!accessToken) {
      const errorResponse = NextResponse.json({ error: 'Access token is required' }, { status: 401 });
      return addCorsHeaders(errorResponse, origin);
    }

    const clioResponse = await fetch(`${CLIO_API_BASE_URL}/${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (clioResponse.status === 204 || clioResponse.headers.get('Content-Length') === '0') {
        const successResponse = new NextResponse(null, { status: 204 });
        return addCorsHeaders(successResponse, origin);
    }
    
    const data = await clioResponse.json();

    if (!clioResponse.ok) {
      const errorMessage = data?.error?.message || 'An error occurred with the Clio API';
      const errorResponse = NextResponse.json({ details: data }, { status: clioResponse.status, statusText: errorMessage });
      return addCorsHeaders(errorResponse, origin);
    }

    const successDataResponse = NextResponse.json(data);
    return addCorsHeaders(successDataResponse, origin);

  } catch (error: any) {
    console.error('API proxy error:', error);
    const internalErrorResponse = NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    return addCorsHeaders(internalErrorResponse, origin);
  }
}
