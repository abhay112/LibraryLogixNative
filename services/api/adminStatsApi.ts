import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface AttendanceStats {
  presentCount: number;
  absentCount: number;
}

export interface FeesStats {
  totalFeesRecords: number;
  pendingFees: number;
}

export interface GenderStats {
  male: number;
  female: number;
  other: number;
}

export interface SeatLayoutInfo {
  seatLayout: {
    _id: string;
    libraryId: string;
    adminId: string;
    rows: number;
    columns: number;
    totalSeats: number;
    availableSeats: number;
    fixedSeats: number;
    blockedSeats: number;
    isActive: boolean;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  seats: any[];
}

export interface AdminStats {
  attendance: AttendanceStats;
  fees: FeesStats;
  genderStats: GenderStats;
  seatLayout: {
    MORNING: SeatLayoutInfo;
    AFTERNOON: SeatLayoutInfo;
    EVENING: SeatLayoutInfo;
    FULL_DAY: SeatLayoutInfo;
  };
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

