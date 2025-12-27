export type UserRole = 'admin' | 'student' | 'parent';

export interface User {
  id?: string;
  _id?: string; // API uses _id
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  studentId?: string;
  libraryId?: string;
  profilePicture?: string;
  membershipStatus?: 'active' | 'inactive' | 'expired';
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  seatNumber?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent';
}

export interface Seat {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  category?: string;
  studentId?: string;
}

export interface Query {
  id: string;
  studentId: string;
  subject: string;
  question: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'answered' | 'closed';
  createdAt: string;
  answeredAt?: string;
  answer?: string;
  attachments?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  registrationRequired: boolean;
  registeredCount: number;
  maxAttendees?: number;
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  instructions: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  score?: number;
  grade?: string;
}

export interface Fee {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  paymentMethod?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'students' | 'parents';
  createdAt: string;
  attachments?: string[];
}

