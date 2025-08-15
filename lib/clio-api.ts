import { getSession } from 'next-auth/react';

const CLIO_API_BASE_URL = 'https://app.clio.com/api/v4';

// Generic function to make requests to the Clio API via our own API proxy
async function request(endpoint: string, accessToken: string, options: RequestInit = {}) {
  if (!accessToken) {
    throw new Error('Access token not found. Please authenticate with Clio.');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/clio`;

  const response = await fetch(apiUrl, {
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
export async function getMatters(accessToken: string, limit: number = 15, offset: number = 0, status: string = 'All', order: string = 'id(asc)', created_since?: string) {
  let endpoint = `matters?limit=${limit}&offset=${offset}&fields=id,display_number,description,last_activity_date,created_at`;
  if (status && status !== 'All') {
    endpoint += `&status=${status}`;
  }
  if (order) {
    endpoint += `&order=${order}`;
  }
  if (created_since) {
    endpoint += `&created_since=${created_since}`;
  }
  return request(endpoint, accessToken);
}

export async function getMattersTotalCount(accessToken: string, status: string = 'All') {
  let endpoint = 'matters?limit=1&fields=id';
  if (status && status !== 'All') {
    endpoint += `&status=${status}`;
  }
  const result = await request(endpoint, accessToken);
  return result.meta.records;
}

// Function to get details for a single matter
export async function getMatterDetails(accessToken:string, matterId: string) {
    const fields = 'id,display_number,description,status,open_date,client{id,name},practice_area{name},responsible_attorney{name},billing_method,created_at,updated_at,maildrop_address';
    return request(`matters/${matterId}?fields=${fields}`, accessToken);
}

// Function to get the count of unread matters
// Function to get the count of bills awaiting payment
export async function getBillsAwaitingPaymentCount(accessToken: string) {
    const result = await request('bills?state=awaiting_payment&limit=1&fields=id', accessToken);
    return result.meta.records;
}

// Function to get the count of pending matters
export async function getPendingMattersCount(accessToken: string) {
    const result = await request('matters?status=Pending&limit=1&fields=id', accessToken);
    return result.meta.records;
}

// Function to get the count of outstanding client balances
export async function getOutstandingClientBalancesCount(accessToken: string) {
    const result = await request('bills/outstanding_balances.json?limit=1&fields=id', accessToken);
    return result.meta.records;
}

// Function to get activities
export async function getActivities(accessToken: string, updatedSince: string) {
    return request(`activities?updated_since=${updatedSince}`, accessToken);
}

// Function to get tasks
export async function getTasks(accessToken: string, limit: number = 6, offset: number = 0, status: string = 'All', order: string = 'due_at(asc)', taskTypeId: string = '', created_since?: string) {
    if (status === 'incomplete') {
        const statuses = ['pending', 'in_progress', 'in_review'];
        const promises = statuses.map(s => {
            let endpoint = `tasks?limit=${limit}&offset=${offset}&fields=id,name,created_at,due_at,status,task_type{name},priority`;
            endpoint += `&status=${s}`;
            if (order && order !== 'Default') {
                endpoint += `&order=${order}`;
            }
            if (taskTypeId) {
                if (taskTypeId === '__NULL__') {
                    endpoint += `&task_type_id[is_null]=true`;
                } else {
                    endpoint += `&task_type_id=${taskTypeId}`;
                }
            }
            if (created_since) {
                endpoint += `&created_since=${created_since}`;
            }
            return request(endpoint, accessToken);
        });
        const results = await Promise.all(promises);
        const combinedData = results.reduce((acc, result) => acc.concat(result.data), []);
        return { data: combinedData };
    } else {
        let endpoint = `tasks?limit=${limit}&offset=${offset}&fields=id,name,created_at,due_at,status,task_type{name},priority`;
        if (status && status !== 'All') {
            endpoint += `&status=${status}`;
        }
        if (order && order !== 'Default') {
            endpoint += `&order=${order}`;
        }
        if (taskTypeId) {
            if (taskTypeId === '__NULL__') {
                endpoint += `&task_type_id[is_null]=true`;
            } else {
                endpoint += `&task_type_id=${taskTypeId}`;
            }
        }
        if (created_since) {
            endpoint += `&created_since=${created_since}`;
        }
        return request(endpoint, accessToken);
    }
}

export async function getAllTasks(accessToken: string) {
  return request(`tasks?fields=id,name,created_at,due_at,status,task_type{name},priority`, accessToken);
}

// Function to get the total count of tasks
export async function getTasksTotalCount(accessToken: string, status: string = 'All') {
    let endpoint = 'tasks?limit=1&fields=id';
    if (status && status !== 'All') {
        endpoint += `&status=${status}`;
    }
    const result = await request(endpoint, accessToken);
    return result.meta.records;
}

// Function to get details for a single task
export async function getTaskDetails(accessToken: string, taskId: string) {
    const fields = 'id,name,description,due_at,completed_at,status,priority,task_type{name},matter{display_number}';
    return request(`tasks/${taskId}?fields=${fields}`, accessToken);
}

export async function getTaskTypes(accessToken: string) {
  return request('task_types?fields=id,name', accessToken);
}

export async function getClioCalendarEvents(accessToken: string, created_since?: string) {
  const fields = 'id,start_at,end_at,summary,description,location{name},attendees{name},calendar_entry_event_type{name},created_at';
  let url = `calendar_entries?fields=${fields}&order=id(desc)`;
  if (created_since) {
    url += `&created_since=${created_since}`;
  }
  return request(url, accessToken);
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

export async function getUntouchedCasesCount(accessToken: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const endpoint = `matters?updated_until=${thirtyDaysAgo.toISOString()}&limit=1&fields=id`;
    const result = await request(endpoint, accessToken);
    return result.meta.records;
}

export async function getInactiveMattersCount(accessToken: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const endpoint = `matters?last_activity_until=${thirtyDaysAgo.toISOString()}&limit=1&fields=id`;
    const result = await request(endpoint, accessToken);
    return result.meta.records;
}

export async function getInactiveClientsCount(accessToken: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const endpoint = `communications?updated_until=${thirtyDaysAgo.toISOString()}&limit=1&fields=id`;
    const result = await request(endpoint, accessToken);
    return result.meta.records;
}

export async function getDocketsToReviewCount(accessToken: string) {
    const today = new Date().toISOString().split('T')[0];
    const endpoint = `calendar_entries?start_date=${today}&limit=1&fields=id`;
    const result = await request(endpoint, accessToken);
    return result.meta.records;
}

export async function getOutstandingTasksCount(accessToken: string) {
    const endpoint = `tasks?status=in_progress&limit=1&fields=id`;
    const result = await request(endpoint, accessToken);
    return result.meta.records;
}

export async function getPastDueTasksCount(accessToken: string) {
    const today = new Date().toISOString();
    const statuses = ['pending', 'in_progress', 'in_review'];
    let total = 0;
    for (const status of statuses) {
        try {
            const endpoint = `tasks?due_until=${today}&status=${status}&limit=1&fields=id`;
            const result = await request(endpoint, accessToken);
            if (result?.meta?.records) {
                total += result.meta.records;
            }
        } catch (error) {
            console.error(`Failed to fetch past due tasks for status ${status}:`, error);
        }
    }
    return total;
}

export async function getNegativeBalanceCasesCount(accessToken: string) {
    const endpoint = `bills?balance_condition=less_than_0&limit=1&fields=id`;
    const result = await request(endpoint, accessToken);
    return result.meta.records;
}

export async function getReplenishmentNeededCount(accessToken: string) {
    // This is a simplified check. We're counting matters with a trust balance of exactly 0.
    const endpoint = `billable_matters?amount_in_trust_condition=0&limit=1&fields=id`;
    const result = await request(endpoint, accessToken);
    return result.meta.records;
}

export async function createCalendarEvent(accessToken: string, eventData: any) {
    return request('calendar_entries', accessToken, {
        method: 'POST',
        body: JSON.stringify({ data: eventData }),
    });
}

export async function getCurrentUser(accessToken: string) {
    return request('users/who_am_i', accessToken);
}