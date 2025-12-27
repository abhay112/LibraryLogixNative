import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface Visitor {
  _id: string;
  name: string;
  email?: string;
  mobile: string;
  purpose: string;
  adminId: string;
  libraryId: string;
  status: 'ACTIVE' | 'EXITED' | 'EXPIRED';
  validUntil?: string;
  entryTime?: string;
  exitTime?: string;
}

export interface CreateVisitorRequest {
  name: string;
  email?: string;
  mobile: string;
  purpose: string;
  adminId: string;
  libraryId: string;
  validUntil?: string;
}

export interface GetVisitorsParams {
  adminId: string;
  libraryId: string;
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface VisitorsResponse {
  success: boolean;
  message: string;
  data: Visitor[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VisitorAnalyticsParams {
  libraryId: string;
  adminId: string;
  startDate: string;
  endDate: string;
}

export interface VisitorAnalytics {
  totalVisitors: number;
  activeVisitors: number;
  exitedVisitors: number;
  expiredVisitors: number;
  averageVisitDuration: number;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
  visitorsByPurpose: Array<{
    purpose: string;
    count: number;
  }>;
}

export const visitorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all visitors
    getVisitors: builder.query<VisitorsResponse, GetVisitorsParams>({
      query: (params) => ({
        url: API_ENDPOINTS.VISITORS.BASE,
        params,
      }),
      providesTags: ['Visitor'],
    }),

    // Get visitor by ID
    getVisitorById: builder.query<{ success: boolean; message: string; data: Visitor }, string>({
      query: (id) => API_ENDPOINTS.VISITORS.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Visitor', id }],
    }),

    // Create visitor
    createVisitor: builder.mutation<{ success: boolean; message: string; data: Visitor }, CreateVisitorRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.VISITORS.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Visitor'],
    }),

    // Update visitor
    updateVisitor: builder.mutation<
      { success: boolean; message: string; data: Visitor },
      { id: string; data: Partial<CreateVisitorRequest> }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.VISITORS.BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Visitor', id }],
    }),

    // Mark visitor exit
    markVisitorExit: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.VISITORS.EXIT(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Visitor', id }],
    }),

    // Get active visitors
    getActiveVisitors: builder.query<
      { success: boolean; message: string; data: Visitor[] },
      { libraryId: string; adminId: string }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.VISITORS.ACTIVE,
        params,
      }),
      providesTags: ['Visitor'],
    }),

    // Delete visitor
    deleteVisitor: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.VISITORS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Visitor'],
    }),

    // Get visitor analytics
    getVisitorAnalytics: builder.query<
      { success: boolean; message: string; data: VisitorAnalytics },
      VisitorAnalyticsParams
    >({
      query: (params) => ({
        url: API_ENDPOINTS.VISITORS.ANALYTICS,
        params,
      }),
      providesTags: ['Visitor'],
    }),
  }),
});

export const {
  useGetVisitorsQuery,
  useGetVisitorByIdQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useMarkVisitorExitMutation,
  useGetActiveVisitorsQuery,
  useDeleteVisitorMutation,
  useGetVisitorAnalyticsQuery,
} = visitorsApi;

