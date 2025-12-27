import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface Seat {
  _id: string;
  seatNumber: number;
  row: number;
  col: number;
  status: 'BLOCKED' | 'FIXED' | 'BLANK' | 'VACANT' | 'FILLED';
  currentAssignment?: {
    studentId: string;
    assignmentType: 'FIXED' | 'TEMPORARY';
  };
}

export interface SeatLayout {
  _id: string;
  libraryId: string;
  adminId: string;
  rows: number;
  columns: number;
  totalSeats: number;
  availableSeats: number;
  isActive?: boolean;
}

export interface GetSeatLayoutParams {
  adminId?: string;
  libraryId?: string;
  date?: string;
  shift?: string;
}

export interface SeatLayoutResponse {
  message: string;
  seatLayout: SeatLayout;
  seats: Seat[];
}

export interface CreateSeatLayoutRequest {
  libraryId: string;
  adminId: string;
  rows: number;
  columns: number;
  seats: number[][];
}

export interface UpdateSeatStatusRequest {
  libraryId: string;
  adminId: string;
  seatId: string;
  rowIndex: number;
  colIndex: number;
  status: 'BLOCKED' | 'FIXED' | 'BLANK' | 'VACANT';
  reason?: string;
}

export interface AssignFixedSeatRequest {
  seatId: string;
  studentId: string;
  libraryId: string;
  adminId: string;
}

export interface SaveLayoutJsonRequest {
  libraryId: string;
  adminId: string;
  layoutJson: Record<string, any>;
}

export const seatLayoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get seat layout
    getSeatLayout: builder.query<SeatLayoutResponse, GetSeatLayoutParams>({
      query: (params) => ({
        url: API_ENDPOINTS.SEAT_LAYOUT.BASE,
        params,
      }),
      providesTags: ['SeatLayout'],
    }),

    // Create seat layout
    createSeatLayout: builder.mutation<{ message: string; seatLayout: SeatLayout }, CreateSeatLayoutRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.SEAT_LAYOUT.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SeatLayout'],
    }),

    // Update seat status
    updateSeatStatus: builder.mutation<{ message: string; data: Seat }, UpdateSeatStatusRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.SEAT_LAYOUT.UPDATE_STATUS,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SeatLayout'],
    }),

    // Assign fixed seat
    assignFixedSeat: builder.mutation<
      { message: string; seat: Seat; assignment: any },
      AssignFixedSeatRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.SEAT_LAYOUT.ASSIGN_FIXED,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SeatLayout'],
    }),

    // Unassign fixed seat
    unassignFixedSeat: builder.mutation<{ message: string }, { seatId: string; studentId: string }>({
      query: ({ seatId, studentId }) => ({
        url: API_ENDPOINTS.SEAT_LAYOUT.UNASSIGN_FIXED(seatId, studentId),
        method: 'POST',
      }),
      invalidatesTags: ['SeatLayout'],
    }),

    // Get student current seat
    getStudentSeat: builder.query<{ message: string; assignment: any }, string>({
      query: (studentId) => API_ENDPOINTS.SEAT_LAYOUT.STUDENT_SEAT(studentId),
      providesTags: ['SeatLayout'],
    }),

    // Get seat layout statistics
    getSeatLayoutStats: builder.query<{ message: string; stats: any }, string>({
      query: (seatLayoutId) => API_ENDPOINTS.SEAT_LAYOUT.STATS(seatLayoutId),
      providesTags: ['SeatLayout'],
    }),

    // Publish seat layout
    publishSeatLayout: builder.mutation<{ message: string; seatLayout: SeatLayout }, string>({
      query: (seatLayoutId) => ({
        url: API_ENDPOINTS.SEAT_LAYOUT.PUBLISH(seatLayoutId),
        method: 'POST',
      }),
      invalidatesTags: ['SeatLayout'],
    }),

    // Unpublish seat layout
    unpublishSeatLayout: builder.mutation<{ message: string; seatLayout: SeatLayout }, string>({
      query: (seatLayoutId) => ({
        url: API_ENDPOINTS.SEAT_LAYOUT.UNPUBLISH(seatLayoutId),
        method: 'POST',
      }),
      invalidatesTags: ['SeatLayout'],
    }),

    // Save layout JSON
    saveLayoutJson: builder.mutation<
      { message: string; seatLayout: SeatLayout & { layoutData: Record<string, any> } },
      SaveLayoutJsonRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.SEAT_LAYOUT.SAVE_LAYOUT,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SeatLayout'],
    }),
  }),
});

export const {
  useGetSeatLayoutQuery,
  useCreateSeatLayoutMutation,
  useUpdateSeatStatusMutation,
  useAssignFixedSeatMutation,
  useUnassignFixedSeatMutation,
  useGetStudentSeatQuery,
  useGetSeatLayoutStatsQuery,
  usePublishSeatLayoutMutation,
  useUnpublishSeatLayoutMutation,
  useSaveLayoutJsonMutation,
} = seatLayoutApi;

