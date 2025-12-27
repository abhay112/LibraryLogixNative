import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export type ReportType =
  | 'ATTENDANCE'
  | 'FEES'
  | 'STUDENT_PERFORMANCE'
  | 'SEAT_UTILIZATION'
  | 'FINANCIAL'
  | 'STAFF_ATTENDANCE'
  | 'VISITOR'
  | 'INVENTORY'
  | 'CUSTOM';

export type ReportStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface Report {
  _id: string;
  reportType: ReportType;
  adminId: string;
  libraryId: string;
  startDate?: string;
  endDate?: string;
  status: ReportStatus;
  fileUrl?: string;
  errorMessage?: string;
  parameters?: Record<string, any>;
  createdAt?: string;
}

export interface CreateReportRequest {
  reportType: ReportType;
  adminId: string;
  libraryId: string;
  startDate?: string;
  endDate?: string;
  parameters?: Record<string, any>;
}

export interface GetReportsParams {
  adminId: string;
  libraryId: string;
  reportType?: ReportType;
  status?: ReportStatus;
  page?: number;
  limit?: number;
}

export interface ReportsResponse {
  success: boolean;
  message: string;
  data: Report[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all reports
    getReports: builder.query<ReportsResponse, GetReportsParams>({
      query: (params) => ({
        url: API_ENDPOINTS.REPORTS.BASE,
        params,
      }),
      providesTags: ['Report'],
    }),

    // Get report by ID
    getReportById: builder.query<{ success: boolean; message: string; data: Report }, string>({
      query: (id) => API_ENDPOINTS.REPORTS.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Report', id }],
    }),

    // Create report
    createReport: builder.mutation<{ success: boolean; message: string; data: Report }, CreateReportRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.REPORTS.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Report'],
    }),

    // Update report status
    updateReportStatus: builder.mutation<
      { success: boolean; message: string; data: Report },
      { id: string; status: ReportStatus; fileUrl?: string; errorMessage?: string }
    >({
      query: ({ id, status, fileUrl, errorMessage }) => ({
        url: API_ENDPOINTS.REPORTS.STATUS(id),
        method: 'PUT',
        params: { status },
        body: { fileUrl, errorMessage },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Report', id }],
    }),

    // Delete report
    deleteReport: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.REPORTS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Report'],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGetReportByIdQuery,
  useCreateReportMutation,
  useUpdateReportStatusMutation,
  useDeleteReportMutation,
} = reportsApi;

