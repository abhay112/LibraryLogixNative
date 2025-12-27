import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface AdminStats {
  totalStudents: number;
  activeStudents: number;
  totalAttendance: number;
  feesCollected: number;
  feesPending: number;
}

export interface AdminStatsResponse {
  message: string;
  data: AdminStats;
}

export const adminStatsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStatsResponse, { adminId: string }>({
      query: ({ adminId }) => ({
        url: API_ENDPOINTS.ADMIN_STATS,
        params: { adminId },
      }),
      providesTags: ['AdminStats'],
    }),
  }),
});

export const { useGetAdminStatsQuery } = adminStatsApi;

