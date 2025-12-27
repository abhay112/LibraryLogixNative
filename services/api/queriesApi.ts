import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface Query {
  answeredAt: string | number | Date;
  _id: string;
  question: string;
  answer?: string;
  status: 'PENDING' | 'ANSWERED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  studentId?: string;
  subject?: string;
  createdAt?: string;
}

export interface GetQueriesParams {
  adminId?: string;
  libraryId?: string;
  studentId?: string;
  status?: 'PENDING' | 'ANSWERED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  page?: number;
  limit?: number;
}

export interface QueriesResponse {
  success: boolean;
  message: string;
  data: Query[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AnswerQueryRequest {
  answer: string;
}

export interface UpdateQueryStatusRequest {
  status: 'PENDING' | 'ANSWERED' | 'CLOSED';
}

export interface CreateQueryRequest {
  subject: string;
  question: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  studentId?: string;
  adminId?: string;
  libraryId?: string;
}

export const queriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all queries
    getQueries: builder.query<QueriesResponse, GetQueriesParams>({
      query: (params) => ({
        url: API_ENDPOINTS.QUERIES.BASE,
        params,
      }),
      providesTags: ['Query'],
    }),

    // Create query
    createQuery: builder.mutation<
      { success: boolean; message: string; data: Query },
      CreateQueryRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.QUERIES.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Query'],
    }),

    // Get query by ID
    getQueryById: builder.query<{ success: boolean; message: string; data: Query }, string>({
      query: (id) => API_ENDPOINTS.QUERIES.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Query', id }],
    }),

    // Answer query
    answerQuery: builder.mutation<
      { success: boolean; message: string; data: Query },
      { id: string; adminId: string; data: AnswerQueryRequest }
    >({
      query: ({ id, adminId, data }) => ({
        url: API_ENDPOINTS.QUERIES.ANSWER(id),
        method: 'POST',
        params: { adminId },
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Query', id }],
    }),

    // Update query status
    updateQueryStatus: builder.mutation<
      { success: boolean; message: string; data: Query },
      { id: string; data: UpdateQueryStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.QUERIES.STATUS(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Query', id }],
    }),

    // Delete query
    deleteQuery: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.QUERIES.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Query'],
    }),
  }),
});

export const {
  useGetQueriesQuery,
  useGetQueryByIdQuery,
  useCreateQueryMutation,
  useAnswerQueryMutation,
  useUpdateQueryStatusMutation,
  useDeleteQueryMutation,
} = queriesApi;

