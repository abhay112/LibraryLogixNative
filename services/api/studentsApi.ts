import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface Student {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  shift?: 'morning' | 'afternoon' | 'evening' | 'full_day';
  type?: string;
  active?: boolean;
  blocked?: boolean;
  isPaused?: boolean;
  libraryId?: string;
  adminId?: string;
  dateOfJoining?: string;
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  fixedSeatNumber?: number;
  lastPauseDate?: string;
  lastResumeDate?: string;
  blockedAt?: string;
  pauseHistory?: Array<{
    pauseDate: string;
    resumeDate?: string;
    reason?: string;
  }>;
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
  adminId: string;
  libraryId: string;
  shift?: 'morning' | 'afternoon' | 'evening' | 'full_day';
  amount?: number;
  dateOfJoining?: string;
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  fixedSeatNumber?: number;
}

export interface GetStudentsParams {
  adminId: string;
  libraryId: string;
  name?: string;
  email?: string;
  active?: boolean | string;
  page?: number;
  limit?: number;
}

export interface StudentsResponse {
  success: boolean;
  message: string;
  data: Student[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentDetailsResponse {
  success: boolean;
  message: string;
  data: {
    studentInformation: {
      name: string;
      email: string;
      mobile: string;
      photo?: string;
      shift: string;
      gender?: string;
      active: boolean;
      dateOfJoining: string;
    };
    feesStatus: Array<{
      monthYear: string;
      isDue: boolean;
      status: 'paid' | 'overdue' | 'due_soon' | 'pending';
      amount: number;
      paidAmount: number;
      feesDetails: Array<{
        date: string;
        amount: number;
        status: string;
        shift: string;
      }>;
    }>;
    attendance: Array<{
      date: string;
      isPresent: boolean;
    }>;
  };
}

export interface BlockStudentRequest {
  reason?: string;
}

export interface ActivateStudentRequest {
  newJoinDate?: string;
}

export interface ChangeShiftRequest {
  newShift: 'morning' | 'afternoon' | 'evening' | 'full_day';
}

export interface OverallAttendanceParams {
  adminId: string;
  libraryId: string;
  startDate?: string;
  endDate?: string;
}

export interface OverallAttendanceResponse {
  success: boolean;
  message: string;
  data: {
    totalStudents: number;
    totalPresent: number;
    totalAbsent: number;
    attendancePercentage: number;
    students: Array<{
      studentId: string;
      studentName: string;
      email: string;
      mobile: string;
      shift: string;
      presentDays: number;
      absentDays: number;
      totalDays: number;
      attendancePercentage: number;
    }>;
  };
}

export interface InactiveStudentsParams {
  adminId: string;
  libraryId: string;
  page?: number;
  limit?: number;
}

export const studentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all students
    getStudents: builder.query<StudentsResponse, GetStudentsParams>({
      query: (params) => ({
        url: API_ENDPOINTS.STUDENTS.BASE,
        params,
      }),
      providesTags: ['Student'],
    }),

    // Get student by ID
    getStudentById: builder.query<{ success: boolean; message: string; data: Student }, string>({
      query: (id) => API_ENDPOINTS.STUDENTS.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),

    // Get student details with fees and attendance
    getStudentDetails: builder.query<StudentDetailsResponse, string>({
      query: (id) => API_ENDPOINTS.STUDENTS.DETAILS(id),
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),

    // Create student
    createStudent: builder.mutation<{ success: boolean; message: string; data: Student }, CreateStudentRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.STUDENTS.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Student'],
    }),

    // Update student
    updateStudent: builder.mutation<
      { success: boolean; message: string; data: Student },
      { id: string; data: Partial<CreateStudentRequest> }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.STUDENTS.BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }],
    }),

    // Delete student
    deleteStudent: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.STUDENTS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Student'],
    }),

    // Block student
    blockStudent: builder.mutation<
      { success: boolean; message: string; data: Student },
      { id: string; data?: BlockStudentRequest }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.STUDENTS.BLOCK(id),
        method: 'PATCH',
        body: data || {},
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }, 'Student'],
    }),

    // Activate student
    activateStudent: builder.mutation<
      { success: boolean; message: string; data: Student },
      { id: string; data?: ActivateStudentRequest }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.STUDENTS.ACTIVATE(id),
        method: 'PATCH',
        body: data || {},
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }, 'Student'],
    }),

    // Inactivate student
    inactivateStudent: builder.mutation<
      { success: boolean; message: string; data: Student },
      string
    >({
      query: (id) => ({
        url: API_ENDPOINTS.STUDENTS.INACTIVATE(id),
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Student', id }, 'Student'],
    }),

    // Get inactive students list
    getInactiveStudents: builder.query<StudentsResponse, InactiveStudentsParams>({
      query: (params) => ({
        url: API_ENDPOINTS.STUDENTS.INACTIVE_LIST,
        params,
      }),
      providesTags: ['Student'],
    }),

    // Change student shift
    changeStudentShift: builder.mutation<
      { success: boolean; message: string; data: Student },
      { id: string; data: ChangeShiftRequest }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.STUDENTS.CHANGE_SHIFT(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }, 'Student'],
    }),

    // Get overall attendance
    getOverallAttendance: builder.query<OverallAttendanceResponse, OverallAttendanceParams>({
      query: (params) => ({
        url: API_ENDPOINTS.STUDENTS.ATTENDANCE_OVERALL,
        params,
      }),
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useGetStudentDetailsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useBlockStudentMutation,
  useActivateStudentMutation,
  useInactivateStudentMutation,
  useGetInactiveStudentsQuery,
  useChangeStudentShiftMutation,
  useGetOverallAttendanceQuery,
} = studentsApi;

