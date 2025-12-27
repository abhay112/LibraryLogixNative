// Centralized API interfaces - re-export from API slices
export type {
  Student,
  CreateStudentRequest,
  GetStudentsParams,
  StudentsResponse,
  StudentDetailsResponse,
  BlockStudentRequest,
  ActivateStudentRequest,
  ChangeShiftRequest,
  OverallAttendanceParams,
  OverallAttendanceResponse,
  InactiveStudentsParams,
} from '../services/api/studentsApi';

export type {
  Staff,
  CreateStaffRequest,
  GetStaffParams,
  StaffResponse,
} from '../services/api/staffApi';

export type {
  InventoryItem,
  CreateInventoryRequest,
  GetInventoryParams,
  InventoryResponse,
  MaintenanceRecord,
} from '../services/api/inventoryApi';

export type {
  Document,
  CreateDocumentRequest,
  GetDocumentsParams,
  DocumentsResponse,
} from '../services/api/documentsApi';

export type {
  Visitor,
  CreateVisitorRequest,
  GetVisitorsParams,
  VisitorsResponse,
} from '../services/api/visitorsApi';

export type {
  Report,
  ReportType,
  ReportStatus,
  CreateReportRequest,
  GetReportsParams,
  ReportsResponse,
} from '../services/api/reportsApi';

export type {
  Query,
  CreateQueryRequest,
  GetQueriesParams,
  QueriesResponse,
  AnswerQueryRequest,
  UpdateQueryStatusRequest,
} from '../services/api/queriesApi';

export type {
  Announcement,
  CreateAnnouncementRequest,
  GetAnnouncementsParams,
  Message,
  SendMessageRequest,
  GetMessagesParams,
  UnreadCountParams,
} from '../services/api/communicationApi';

export type {
  Fee,
  CreateFeesRequest,
  GetFeesParams,
  GetFeesFilterParams,
  FeesResponse,
  RoundFigureFeesRequest,
  UpcomingFeesDueParams,
} from '../services/api/feesApi';

export type {
  AttendanceRecord,
  AttendanceResponse,
  CreateAttendanceRequest,
  AssignSeatRequest,
  VacantSeatRequest,
  StudentAttendanceHistoryParams,
  MarkStudentAbsentRequest,
  MarkMultipleStudentsAbsentRequest,
  MarkAbsentResponse,
  MarkMultipleAbsentResponse,
  AttendanceByShiftParams,
  AttendanceByShiftStudent,
  AttendanceByShiftResponse,
} from '../services/api/attendanceApi';

export type {
  Seat,
  SeatLayout,
  GetSeatLayoutParams,
  SeatLayoutResponse,
  CreateSeatLayoutRequest,
  UpdateSeatStatusRequest,
  AssignFixedSeatRequest,
} from '../services/api/seatLayoutApi';

export type {
  LoginRequest,
  LoginResponse,
} from '../services/api/authApi';

export type {
  AdminStats,
  AdminStatsResponse,
} from '../services/api/adminStatsApi';

export type {
  Shift,
  CreateShiftRequest,
  UpdateShiftRequest,
  GetShiftsParams,
  ShiftsResponse,
} from '../services/api/shiftsApi';

export type {
  SaveLayoutJsonRequest,
} from '../services/api/seatLayoutApi';

export type {
  StaffAttendance,
  CreateStaffAttendanceRequest,
  UpdateStaffAttendanceRequest,
  GetStaffAttendanceParams,
  StaffSchedule,
  CreateStaffScheduleRequest,
  UpdateStaffScheduleRequest,
} from '../services/api/staffApi';

export type {
  VisitorAnalyticsParams,
  VisitorAnalytics,
} from '../services/api/visitorsApi';

