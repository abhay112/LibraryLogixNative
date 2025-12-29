import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface AttendanceRecord {
  _id: string;
  studentId: string;
  seatNumber?: number;
  shift?: string;
  status: string;
  date?: string;
}

export interface AttendanceRecordWithStudent {
  _id: string;
  attendanceId: string;
  studentId: string | {
    _id: string;
    name: string;
    email: string;
    mobile: string;
  };
  adminId: string;
  libraryId: string;
  date: string;
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
  checkInTime?: string | null;
  checkOutTime?: string | null;
  totalHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE';
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  seatId?: string | null;
  seatAssignmentId?: string | null;
  seatNumber?: number | null;
}

export interface AttendanceResponse {
  message: string;
  data: {
    attendance: {
      _id: string;
      date: string;
      adminId: string;
      libraryId: string;
      seatLayoutId: string;
      attendanceRecords: AttendanceRecordWithStudent[];
      totalPresent: number;
      totalAbsent: number;
      morningPresent: number;
      afternoonPresent: number;
      eveningPresent: number;
      fullDayPresent: number;
      deleted: boolean;
      createdAt: string;
      updatedAt: string;
    };
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
    };
    seats: any[];
    attendanceRecords: AttendanceRecordWithStudent[];
  };
}

export interface CreateAttendanceRequest {
  libraryId: string;
  adminId: string;
}

export interface AssignSeatRequest {
  adminId: string;
  seatNumber: number;
  studentId: string;
}

export interface VacantSeatRequest {
  adminId: string;
  seatNumber: number;
  shift: string;
  studentId: string;
}

export interface StudentAttendanceHistoryParams {
  studentId: string;
  startDate?: string;
  endDate?: string;
}

export interface MarkStudentAbsentRequest {
  studentId: string;
  date: string; // YYYY-MM-DD format
  adminId: string;
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
  remark?: string;
}

export interface MarkMultipleStudentsAbsentRequest {
  adminId: string;
  date: string; // YYYY-MM-DD format
  studentIds: string[];
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
  remark?: string;
}

export interface MarkAbsentResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    studentId: string;
    date: string;
    shift: string;
    status: 'ABSENT';
    remark?: string;
  };
}

export interface MarkMultipleAbsentResponse {
  success: boolean;
  message: string;
  data: {
    success: number;
    failed: number;
    results: Array<{
      studentId: string;
      success: boolean;
      error?: string;
    }>;
  };
}

export interface AttendanceByShiftParams {
  adminId: string;
  libraryId: string;
  date: string; // YYYY-MM-DD format
  shift?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
}

export interface AttendanceByShiftStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentShift: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE';
  checkInTime?: string;
  checkOutTime?: string;
  seatNumber?: number;
  remark?: string;
}

export interface AttendanceByShiftResponse {
  success: boolean;
  message: string;
  data: {
    date: string;
    shift?: string;
    students: AttendanceByShiftStudent[];
    summary: {
      totalStudents: number;
      present: number;
      absent: number;
      late: number;
      earlyLeave: number;
    };
  };
}

export interface AttendanceRecordDetail {
  _id: string;
  attendanceId: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
  };
  seatId?: string | null;
  seatAssignmentId?: string | null;
  adminId: string;
  libraryId: string;
  date: string;
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
  checkInTime?: string | null;
  checkOutTime?: string | null;
  totalHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE';
  remark?: string | null;
  seatNumber?: number | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceDayRecord {
  _id: string;
  date: string;
  adminId: string;
  libraryId: {
    _id: string;
    name: string;
    address: string;
  };
  seatLayoutId: {
    _id: string;
    name: string;
    rows: number;
    columns: number;
    totalSeats: number;
  };
  attendanceRecords: AttendanceRecordDetail[];
  totalPresent: number;
  totalAbsent: number;
  morningPresent: number;
  afternoonPresent: number;
  eveningPresent: number;
  fullDayPresent: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AllAttendanceResponse {
  success: boolean;
  message: string;
  data: {
    attendanceRecords: AttendanceDayRecord[];
    latestDate: string;
  };
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create attendance record
    createAttendance: builder.mutation<{ message: string; data: any }, CreateAttendanceRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ATTENDANCE.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Get attendance by date
    getAttendanceByDate: builder.query<AttendanceResponse, { date: string; adminId: string; libraryId?: string }>({
      query: ({ date, adminId, libraryId }) => {
        const url = API_ENDPOINTS.ATTENDANCE.BY_DATE(date, adminId);
        return libraryId ? `${url}?libraryId=${encodeURIComponent(libraryId)}` : url;
      },
      providesTags: ['Attendance'],
    }),

    // Assign seat
    assignSeat: builder.mutation<{ message: string; data: boolean }, AssignSeatRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ATTENDANCE.ASSIGN,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Mark seat as vacant
    markSeatVacant: builder.mutation<{ message: string; data: { success: boolean } }, VacantSeatRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ATTENDANCE.VACANT,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Get student attendance by date
    getStudentAttendanceByDate: builder.query<
      { message: string; data: any },
      { studentId: string; date: string }
    >({
      query: ({ studentId, date }) => API_ENDPOINTS.ATTENDANCE.STUDENT_BY_DATE(studentId, date),
      providesTags: ['Attendance'],
    }),

    // Get student attendance history
    getStudentAttendanceHistory: builder.query<
      { message: string; data: any },
      StudentAttendanceHistoryParams
    >({
      query: ({ studentId, startDate, endDate }) => ({
        url: API_ENDPOINTS.ATTENDANCE.STUDENT_HISTORY(studentId),
        params: { startDate, endDate },
      }),
      providesTags: ['Attendance'],
    }),

    // Mark student as absent
    markStudentAbsent: builder.mutation<MarkAbsentResponse, MarkStudentAbsentRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ATTENDANCE.MARK_ABSENT,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Mark multiple students as absent
    markMultipleStudentsAbsent: builder.mutation<
      MarkMultipleAbsentResponse,
      MarkMultipleStudentsAbsentRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.ATTENDANCE.MARK_MULTIPLE_ABSENT,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Get attendance by shift
    getAttendanceByShift: builder.query<AttendanceByShiftResponse, AttendanceByShiftParams>({
      query: (params) => ({
        url: API_ENDPOINTS.ATTENDANCE.BY_SHIFT,
        params,
      }),
      providesTags: ['Attendance'],
    }),

    // Get all attendance records
    getAllAttendance: builder.query<AllAttendanceResponse, string>({
      query: (adminId) => API_ENDPOINTS.ATTENDANCE.ALL(adminId),
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useCreateAttendanceMutation,
  useGetAttendanceByDateQuery,
  useGetAllAttendanceQuery,
  useAssignSeatMutation,
  useMarkSeatVacantMutation,
  useGetStudentAttendanceByDateQuery,
  useGetStudentAttendanceHistoryQuery,
  useMarkStudentAbsentMutation,
  useMarkMultipleStudentsAbsentMutation,
  useGetAttendanceByShiftQuery,
} = attendanceApi;

