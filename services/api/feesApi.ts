import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface Fee {
  _id: string;
  studentId: string;
  studentName?: string;
  mobile?: string;
  fees: Array<{
    date: string;
    amount: number;
    feesStatus: boolean;
    shift: string;
  }>;
  status?: 'paid' | 'overdue' | 'due_soon' | 'pending';
  feesDueDate?: string;
  remainingDays?: number;
  isOverdue?: boolean;
  hasNoDues?: boolean;
  isRoundFigure?: boolean;
  originalAmount?: number;
  adjustedAmount?: number;
  adjustmentReason?: string;
  daysOverdue?: number;
  student?: {
    name: string;
    email: string;
    mobile: string;
    shift: string;
    dateOfJoining: string;
  };
  daysUntilDue?: number;
}

export interface CreateFeesRequest {
  adminId: string;
  studentId: string;
  studentName: string;
  mobile: string;
  libraryId?: string;
  fees: Array<{
    date: string;
    amount: number;
    feesStatus: boolean;
    shift: string;
  }>;
}

export interface GetFeesParams {
  adminId: string;
  libraryId: string;
  studentId?: string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface GetFeesFilterParams {
  month: string; // YYYY-MM format
  status: 'paid' | 'overdue' | 'due_soon' | 'pending';
}

export interface RoundFigureFeesRequest {
  feesId: string;
  adjustedAmount: number;
  reason: string;
  changeToMonthStart: boolean;
}

export interface UpcomingFeesDueParams {
  adminId: string;
  libraryId: string;
  days?: number;
  page?: number;
  limit?: number;
}

export interface FeesResponse {
  success: boolean;
  message: string;
  data: Fee[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const feesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all fees
    getFees: builder.query<FeesResponse, GetFeesParams>({
      query: (params) => ({
        url: API_ENDPOINTS.FEES.BASE,
        params,
      }),
      providesTags: ['Fees'],
    }),

    // Get fees by ID
    getFeesById: builder.query<{ success: boolean; message: string; data: Fee }, string>({
      query: (id) => API_ENDPOINTS.FEES.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Fees', id }],
    }),

    // Get fees by student ID
    getFeesByStudent: builder.query<{ success: boolean; message: string; data: Fee[] }, string>({
      query: (studentId) => API_ENDPOINTS.FEES.BY_STUDENT(studentId),
      providesTags: ['Fees'],
    }),

    // Get fees by month and status
    getFeesByFilter: builder.query<{ success: boolean; message: string; data: Fee[] }, GetFeesFilterParams>({
      query: (params) => ({
        url: API_ENDPOINTS.FEES.FILTER,
        params,
      }),
      providesTags: ['Fees'],
    }),

    // Create fees
    createFees: builder.mutation<{ success: boolean; message: string; data: Fee }, CreateFeesRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.FEES.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Fees'],
    }),

    // Update fees (mark as paid)
    updateFees: builder.mutation<{ success: boolean; message: string; data: Fee }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.FEES.BY_ID(id),
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Fees', id }],
    }),

    // Delete fees
    deleteFees: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.FEES.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Fees'],
    }),

    // Apply round figure fees
    applyRoundFigureFees: builder.mutation<
      { success: boolean; message: string; data: Fee },
      RoundFigureFeesRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.FEES.ROUND_FIGURE,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { feesId }) => [{ type: 'Fees', id: feesId }, 'Fees'],
    }),

    // Get upcoming fees due
    getUpcomingFeesDue: builder.query<FeesResponse, UpcomingFeesDueParams>({
      query: (params) => ({
        url: API_ENDPOINTS.FEES.UPCOMING_DUE,
        params,
      }),
      providesTags: ['Fees'],
    }),
  }),
});

export const {
  useGetFeesQuery,
  useGetFeesByIdQuery,
  useGetFeesByStudentQuery,
  useGetFeesByFilterQuery,
  useCreateFeesMutation,
  useUpdateFeesMutation,
  useDeleteFeesMutation,
  useApplyRoundFigureFeesMutation,
  useGetUpcomingFeesDueQuery,
} = feesApi;

