import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface Shift {
  _id: string;
  adminId: string;
  libraryId: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShiftRequest {
  adminId: string;
  libraryId: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive?: boolean;
}

export interface UpdateShiftRequest {
  name?: string;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  isActive?: boolean;
}

export interface GetShiftsParams {
  adminId: string;
  libraryId: string;
  isActive?: boolean | string;
}

export interface ShiftsResponse {
  success: boolean;
  message: string;
  data: Shift[];
}

export const shiftsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all shifts
    getShifts: builder.query<ShiftsResponse, GetShiftsParams>({
      query: (params) => ({
        url: API_ENDPOINTS.SHIFTS.BASE,
        params,
      }),
      providesTags: ['Shift'],
    }),

    // Get shift by ID
    getShiftById: builder.query<{ success: boolean; message: string; data: Shift }, string>({
      query: (id) => API_ENDPOINTS.SHIFTS.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Shift', id }],
    }),

    // Create shift
    createShift: builder.mutation<{ success: boolean; message: string; data: Shift }, CreateShiftRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.SHIFTS.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shift'],
    }),

    // Update shift
    updateShift: builder.mutation<
      { success: boolean; message: string; data: Shift },
      { id: string; data: UpdateShiftRequest }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.SHIFTS.BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Shift', id }, 'Shift'],
    }),

    // Delete shift
    deleteShift: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.SHIFTS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Shift'],
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} = shiftsApi;

