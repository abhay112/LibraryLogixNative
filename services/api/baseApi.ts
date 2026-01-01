import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from '@/config/api';
import { Storage } from '@/utils/storage';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
  prepareHeaders: async (headers) => {
    // Get access token from storage
    const accessToken = await Storage.getItem('accessToken');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Base query with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - token expired
  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = await Storage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        // Attempt to refresh the token
        const refreshResult = await baseQuery(
          {
            url: API_ENDPOINTS.AUTH.REFRESH,
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data && !refreshResult.error) {
          try {
            const response = refreshResult.data as { success: boolean; data?: { accessToken: string; expiresIn?: number } };
            
            if (response.success && response.data?.accessToken) {
              // Store new access token
              await Storage.setItem('accessToken', response.data.accessToken);
              
              // Retry the original request with new token
              result = await baseQuery(args, api, extraOptions);
            } else {
              // Refresh failed - invalid response structure
              console.warn('Token refresh failed: Invalid response structure', response);
              await Storage.removeItem('accessToken');
              await Storage.removeItem('refreshToken');
              await Storage.removeItem('user');
            }
          } catch (parseError) {
            // Error parsing response
            console.error('Token refresh failed: Error parsing response', parseError);
            await Storage.removeItem('accessToken');
            await Storage.removeItem('refreshToken');
            await Storage.removeItem('user');
          }
        } else {
          // Refresh failed - API error
          console.warn('Token refresh failed: API error', refreshResult.error);
          await Storage.removeItem('accessToken');
          await Storage.removeItem('refreshToken');
          await Storage.removeItem('user');
        }
      } catch (error) {
        // Refresh failed, clear tokens and user data
        await Storage.removeItem('accessToken');
        await Storage.removeItem('refreshToken');
        await Storage.removeItem('user');
      }
    } else {
      // No refresh token, clear user data
      await Storage.removeItem('accessToken');
      await Storage.removeItem('user');
    }
  }

  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Student',
    'Attendance',
    'Fees',
    'SeatLayout',
    'Query',
    'Announcement',
    'Message',
    'Staff',
    'Visitor',
    'Report',
    'Inventory',
    'Document',
    'AdminStats',
    'Shift',
  ],
  endpoints: () => ({}),
});

