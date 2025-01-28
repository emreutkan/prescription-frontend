// src/api/apiFetch.js

const API_BASE_URL = 'https://prescription-gateway-aqgcewarhgbshfev.canadacentral-01.azurewebsites.net'; // Update this if your API base URL changes

/**
 * Custom fetch wrapper to handle API calls with logging and error handling.
 *
 * @param {string} url - The API endpoint (relative to API_BASE_URL).
 * @param {string} method - HTTP method (GET, POST, etc.).
 * @param {object|null} body - Request body for POST, PUT, etc.
 * @param {string|null} token - JWT token for authenticated requests.
 * @returns {Promise<object>} - Parsed JSON response.
 */
const apiFetch = async (url, method = 'GET', body = null, token = null) => {
    console.log(`API Request: ${method} ${API_BASE_URL}${url}`);

    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        const responseData = await response.json();
        console.log(`API Response: ${method} ${API_BASE_URL}${url}`, responseData);
        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
        }
        return responseData;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export default apiFetch;
