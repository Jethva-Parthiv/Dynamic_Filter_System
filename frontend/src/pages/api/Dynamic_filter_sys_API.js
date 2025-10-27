// frontend/utils/api.js
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";


// Helper function to build query string
function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function fetchFilters(filters) {
  const params = {};
  if (filters) {
    params.filters = filters;
  }
  
  const queryString = buildQueryString(params);
  const url = `${API_BASE}/filters${queryString}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching filters:', error);
    throw error;
  }
}

export async function fetchData(filters, limit = 10, offset = 0) {
  const params = {
    limit,
    offset
  };
  
  if (filters) {
    params.filters = filters;
  }
  
  const queryString = buildQueryString(params);
  const url = `${API_BASE}/data${queryString}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function fetchDataCount(filters) {
  const params = {};
  if (filters) {
    params.filters = filters;
  }
  
  const queryString = buildQueryString(params);
  const url = `${API_BASE}/data/count${queryString}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching data count:', error);
    throw error;
  }
}

// Optional: Add a generic API call function with retry logic
export async function apiCall(endpoint, options = {}) {
  const { retries = 3, backoff = 300, ...fetchOptions } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, backoff * attempt));
    }
  }
}