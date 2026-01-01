// API Configuration
// For physical iOS/Android devices, use your Mac's local IP address instead of localhost
// Find your IP with: ifconfig | grep "inet " | grep -v 127.0.0.1
// Or set EXPO_PUBLIC_API_URL environment variable
const getDevApiUrl = () => {
  // Check if custom API URL is set via environment variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Default to local IP for physical devices (works on both simulator and device)
  // Change this to your Mac's local IP address if needed
  // For iOS Simulator, localhost works fine, but for physical devices use your Mac's IP
  return 'http://192.168.1.104:4000/api/v1';
};

export const API_BASE_URL = __DEV__
  ? getDevApiUrl()
  : 'https://api.example.com/api/v1';

export const API_TIMEOUT = 30000; // 30 seconds

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  // Students
  STUDENTS: {
    BASE: '/admin/students',
    DETAILS: (id: string) => `/admin/students/details/${id}`,
    BY_ID: (id: string) => `/admin/students/${id}`,
    BLOCK: (id: string) => `/admin/students/block/${id}`,
    ACTIVATE: (id: string) => `/admin/students/activate/${id}`,
    INACTIVATE: (id: string) => `/admin/students/inactivate/${id}`,
    INACTIVE_LIST: '/admin/students/inactive/list',
    CHANGE_SHIFT: (id: string) => `/admin/students/change-shift/${id}`,
    ATTENDANCE_OVERALL: '/admin/students/attendance/overall',
  },
  // Attendance
  ATTENDANCE: {
    CREATE: '/admin/attendance/create',
    BY_DATE: (date: string, adminId: string) => `/admin/attendance/${date}/${adminId}`,
    ALL: (adminId: string) => `/admin/attendance/all/${adminId}`,
    ASSIGN: '/admin/attendance/assign',
    VACANT: '/admin/attendance/vacant',
    STUDENT_BY_DATE: (studentId: string, date: string) => `/admin/attendance/student/${studentId}/date/${date}`,
    STUDENT_HISTORY: (studentId: string) => `/admin/attendance/student/${studentId}/history`,
    MARK_ABSENT: '/admin/attendance/mark-absent',
    MARK_MULTIPLE_ABSENT: '/admin/attendance/mark-multiple-absent',
    BY_SHIFT: '/admin/attendance/by-shift',
  },
  // Fees
  FEES: {
    BASE: '/admin/fees',
    BY_ID: (id: string) => `/admin/fees/${id}`,
    BY_STUDENT: (studentId: string) => `/admin/fees/student/${studentId}`,
    FILTER: '/admin/fees/filter',
    ROUND_FIGURE: '/admin/fees/round-figure',
    UPCOMING_DUE: '/admin/fees/upcoming-due',
  },
  // Seat Layout
  SEAT_LAYOUT: {
    BASE: '/admin/seatLayout',
    UPDATE_STATUS: '/admin/seatLayout/updateSeatStatus',
    ASSIGN_FIXED: '/admin/seatLayout/assign-fixed-seat',
    UNASSIGN_FIXED: (seatId: string, studentId: string) => `/admin/seatLayout/unassign-fixed-seat/${seatId}/${studentId}`,
    STUDENT_SEAT: (studentId: string) => `/admin/seatLayout/student/${studentId}/seat`,
    STATS: (seatLayoutId: string) => `/admin/seatLayout/stats/${seatLayoutId}`,
    SAVE_LAYOUT: '/admin/seatLayout/save-layout-json',
    PUBLISH: (seatLayoutId: string) => `/admin/seatLayout/publish/${seatLayoutId}`,
    UNPUBLISH: (seatLayoutId: string) => `/admin/seatLayout/unpublish/${seatLayoutId}`,
  },
  // Admin Stats
  ADMIN_STATS: '/admin/stats',
  // Queries
  QUERIES: {
    BASE: '/admin/queries',
    BY_ID: (id: string) => `/admin/queries/${id}`,
    ANSWER: (id: string) => `/admin/queries/${id}/answer`,
    STATUS: (id: string) => `/admin/queries/${id}/status`,
  },
  // Communication
  COMMUNICATION: {
    ANNOUNCEMENTS: {
      BASE: '/admin/communication/announcements',
      BY_ID: (id: string) => `/admin/communication/announcements/${id}`,
    },
    MESSAGES: {
      BASE: '/admin/communication/messages',
      BY_ID: (id: string) => `/admin/communication/messages/${id}`,
      MARK_READ: (id: string) => `/admin/communication/messages/${id}/read`,
      UNREAD_COUNT: '/admin/communication/messages/unread/count',
    },
  },
  // Staff
  STAFF: {
    BASE: '/admin/staff',
    BY_ID: (id: string) => `/admin/staff/${id}`,
    RESTORE: (id: string) => `/admin/staff/${id}/restore`,
    ATTENDANCE: {
      BASE: '/admin/staff/attendance',
      BY_ID: (id: string) => `/admin/staff/attendance/${id}`,
      BY_STAFF: (staffId: string) => `/admin/staff/attendance/${staffId}`,
    },
    SCHEDULE: {
      BASE: '/admin/staff/schedule',
      BY_STAFF: (staffId: string) => `/admin/staff/schedule/${staffId}`,
      BY_ID: (id: string) => `/admin/staff/schedule/${id}`,
    },
  },
  // Visitors
  VISITORS: {
    BASE: '/admin/visitors',
    BY_ID: (id: string) => `/admin/visitors/${id}`,
    EXIT: (id: string) => `/admin/visitors/${id}/exit`,
    ACTIVE: '/admin/visitors/active/list',
    ANALYTICS: '/admin/visitors/analytics/summary',
  },
  // Reports
  REPORTS: {
    BASE: '/admin/reports',
    BY_ID: (id: string) => `/admin/reports/${id}`,
    STATUS: (id: string) => `/admin/reports/${id}/status`,
  },
  // Inventory
  INVENTORY: {
    BASE: '/admin/inventory',
    BY_ID: (id: string) => `/admin/inventory/${id}`,
    MAINTENANCE: {
      BASE: '/admin/inventory/maintenance',
      BY_ITEM: (itemId: string) => `/admin/inventory/maintenance/${itemId}`,
      BY_ID: (id: string) => `/admin/inventory/maintenance/${id}`,
      NEEDED: '/admin/inventory/maintenance/needed/list',
    },
  },
  // Documents
  DOCUMENTS: {
    BASE: '/admin/documents',
    BY_ID: (id: string) => `/admin/documents/${id}`,
    VERIFY: (id: string) => `/admin/documents/${id}/verify`,
    EXPIRING: '/admin/documents/expiring/list',
  },
  // Shifts
  SHIFTS: {
    BASE: '/admin/shifts',
    BY_ID: (id: string) => `/admin/shifts/${id}`,
  },
};

