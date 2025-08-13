import { getSession } from 'next-auth/react';

const CLIO_API_BASE_URL = 'https://app.clio.com/api/v4';

// Generic function to make requests to the Clio API via our own API proxy
async function request(endpoint: string, accessToken: string, options: RequestInit = {}) {
  if (!accessToken) {
    throw new Error('Access token not found. Please authenticate with Clio.');
  }

  const response = await fetch(`/api/clio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      method: options.method || 'GET',
      body: options.body ? JSON.parse(options.body as string) : undefined,
      accessToken, // Pass the token to the proxy
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API request failed: ${errorData.details?.error?.message || 'Unknown error'}`);
  }

  return response.json();
}

// Example function to get matters
export async function getMatters(accessToken: string, limit: number = 15, offset: number = 0) {
  return request(`matters?limit=${limit}&offset=${offset}&fields=id,display_number,description,last_activity_date`, accessToken);
}

// Function to get details for a single matter
export async function getMatterDetails(accessToken:string, matterId: string) {
    const fields = 'id,display_number,description,status,open_date,client{id,name},practice_area{name},responsible_attorney{name},billing_method,created_at,updated_at,maildrop_address';
    return request(`matters/${matterId}?fields=${fields}`, accessToken);
}

// Function to get the count of unread matters
// Function to get the count of bills awaiting payment
export async function getBillsAwaitingPaymentCount(accessToken: string) {
    return request('bills?state=awaiting_payment&limit=1', accessToken);
}

// Function to get the count of pending matters
export async function getPendingMattersCount(accessToken: string) {
    return request('matters?status=Pending&limit=1', accessToken);
}

// Function to get the count of outstanding client balances
export async function getOutstandingClientBalancesCount(accessToken: string) {
    return request('bills/outstanding_balances?limit=1', accessToken);
}

// Function to get activities
export async function getActivities(accessToken: string, updatedSince: string) {
    return request(`activities?updated_since=${updatedSince}`, accessToken);
}

// Example function to get contacts
export async function getContacts(accessToken: string) {
  return request('contacts', accessToken);
}

// Example function to create a contact
export async function createContact(accessToken: string, contactData: any) {
    return request('contacts', accessToken, {
        method: 'POST',
        body: JSON.stringify({ data: contactData }),
    });
}