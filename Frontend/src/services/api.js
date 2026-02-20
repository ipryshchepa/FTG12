import config from '../config';

/**
 * Base fetch wrapper with error handling
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      // Try to extract error from ProblemDetails format
      if (errorData.title) {
        errorMessage = errorData.title;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.errors) {
        errorMessage = Object.values(errorData.errors).flat().join(', ');
      }
    } catch {
      // If parsing fails, use default error message
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return null;
}

/**
 * GET request
 */
export async function get(endpoint) {
  const response = await fetch(`${config.API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  return handleResponse(response);
}

/**
 * POST request
 */
export async function post(endpoint, data) {
  const response = await fetch(`${config.API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return handleResponse(response);
}

/**
 * PUT request
 */
export async function put(endpoint, data) {
  const response = await fetch(`${config.API_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return handleResponse(response);
}

/**
 * DELETE request
 */
export async function del(endpoint) {
  const response = await fetch(`${config.API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  return handleResponse(response);
}
