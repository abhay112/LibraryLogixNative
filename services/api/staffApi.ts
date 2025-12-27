import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface Staff {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'LIBRARIAN' | 'ACCOUNTANT' | 'SECURITY' | 'CLEANER' | 'MANAGER' | 'ASSISTANT';
  adminId: string;
  libraryId: string;
  employeeId?: string;
  department?: string;
  active?: boolean;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  mobile: string;
  role: Staff['role'];
  adminId: string;
  libraryId: string;
  employeeId?: string;
  department?: string;
}

export interface GetStaffParams {
  adminId: string;
  libraryId: string;
  name?: string;
  email?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface StaffResponse {
  success: boolean;
  message: string;
  data: Staff[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StaffAttendance {
  _id: string;
  staffId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
}

export interface CreateStaffAttendanceRequest {
  staffId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
}

export interface UpdateStaffAttendanceRequest {
  checkInTime?: string;
  checkOutTime?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
}

export interface GetStaffAttendanceParams {
  staffId: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

export interface StaffSchedule {
  _id: string;
  staffId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
}

export interface CreateStaffScheduleRequest {
  staffId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive?: boolean;
}

export interface UpdateStaffScheduleRequest {
  dayOfWeek?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  isActive?: boolean;
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all staff
    getStaff: builder.query<StaffResponse, GetStaffParams>({
      query: (params) => ({
        url: API_ENDPOINTS.STAFF.BASE,
        params,
      }),
      providesTags: ['Staff'],
    }),

    // Get staff by ID
    getStaffById: builder.query<{ success: boolean; message: string; data: Staff }, string>({
      query: (id) => API_ENDPOINTS.STAFF.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Staff', id }],
    }),

    // Create staff
    createStaff: builder.mutation<{ success: boolean; message: string; data: Staff }, CreateStaffRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.STAFF.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Staff'],
    }),

    // Update staff
    updateStaff: builder.mutation<
      { success: boolean; message: string; data: Staff },
      { id: string; data: Partial<CreateStaffRequest> }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.STAFF.BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Staff', id }],
    }),

    // Delete staff
    deleteStaff: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.STAFF.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),

    // Restore staff
    restoreStaff: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.STAFF.RESTORE(id),
        method: 'POST',
      }),
      invalidatesTags: ['Staff'],
    }),

    // Staff Attendance
    createStaffAttendance: builder.mutation<
      { success: boolean; message: string; data: StaffAttendance },
      CreateStaffAttendanceRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.STAFF.ATTENDANCE.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Staff'],
    }),

    updateStaffAttendance: builder.mutation<
      { success: boolean; message: string; data: StaffAttendance },
      { id: string; data: UpdateStaffAttendanceRequest }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.STAFF.ATTENDANCE.BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),

    getStaffAttendance: builder.query<
      { success: boolean; message: string; data: StaffAttendance[] },
      GetStaffAttendanceParams
    >({
      query: ({ staffId, startDate, endDate }) => ({
        url: API_ENDPOINTS.STAFF.ATTENDANCE.BY_STAFF(staffId),
        params: { startDate, endDate },
      }),
      providesTags: ['Staff'],
    }),

    // Staff Schedule
    createStaffSchedule: builder.mutation<
      { success: boolean; message: string; data: StaffSchedule },
      CreateStaffScheduleRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.STAFF.SCHEDULE.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Staff'],
    }),

    getStaffSchedule: builder.query<
      { success: boolean; message: string; data: StaffSchedule[] },
      string
    >({
      query: (staffId) => API_ENDPOINTS.STAFF.SCHEDULE.BY_STAFF(staffId),
      providesTags: ['Staff'],
    }),

    updateStaffSchedule: builder.mutation<
      { success: boolean; message: string; data: StaffSchedule },
      { id: string; data: UpdateStaffScheduleRequest }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.STAFF.SCHEDULE.BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),

    deleteStaffSchedule: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.STAFF.SCHEDULE.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useRestoreStaffMutation,
  useCreateStaffAttendanceMutation,
  useUpdateStaffAttendanceMutation,
  useGetStaffAttendanceQuery,
  useCreateStaffScheduleMutation,
  useGetStaffScheduleQuery,
  useUpdateStaffScheduleMutation,
  useDeleteStaffScheduleMutation,
} = staffApi;

