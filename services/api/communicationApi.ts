import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  priority: 'INFO' | 'WARNING' | 'URGENT' | 'EMERGENCY';
  targetAudience: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  priority: 'INFO' | 'WARNING' | 'URGENT' | 'EMERGENCY';
  adminId: string;
  libraryId: string;
  targetAudience: string[];
}

export interface GetAnnouncementsParams {
  adminId: string;
  libraryId: string;
  priority?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface Message {
  _id: string;
  senderAdminId?: string;
  receiverStudentId?: string;
  receiverParentId?: string;
  receiverAdminId?: string;
  subject: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface SendMessageRequest {
  senderAdminId: string;
  receiverStudentId?: string;
  receiverParentId?: string;
  receiverAdminId?: string;
  libraryId: string;
  subject: string;
  message: string;
}

export interface GetMessagesParams {
  libraryId: string;
  receiverStudentId?: string;
  receiverParentId?: string;
  receiverAdminId?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export interface UnreadCountParams {
  libraryId: string;
  receiverId: string;
  receiverType: 'student' | 'parent' | 'admin';
}

export const communicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Announcements
    getAnnouncements: builder.query<
      { success: boolean; message: string; data: Announcement[] },
      GetAnnouncementsParams
    >({
      query: (params) => ({
        url: API_ENDPOINTS.COMMUNICATION.ANNOUNCEMENTS.BASE,
        params,
      }),
      providesTags: ['Announcement'],
    }),

    getAnnouncementById: builder.query<
      { success: boolean; message: string; data: Announcement },
      string
    >({
      query: (id) => API_ENDPOINTS.COMMUNICATION.ANNOUNCEMENTS.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Announcement', id }],
    }),

    createAnnouncement: builder.mutation<
      { success: boolean; message: string; data: Announcement },
      CreateAnnouncementRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.COMMUNICATION.ANNOUNCEMENTS.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Announcement'],
    }),

    updateAnnouncement: builder.mutation<
      { success: boolean; message: string; data: Announcement },
      { id: string; data: Partial<CreateAnnouncementRequest> }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.COMMUNICATION.ANNOUNCEMENTS.BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Announcement', id }],
    }),

    deleteAnnouncement: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.COMMUNICATION.ANNOUNCEMENTS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Announcement'],
    }),

    // Messages
    getMessages: builder.query<
      { success: boolean; message: string; data: Message[] },
      GetMessagesParams
    >({
      query: (params) => ({
        url: API_ENDPOINTS.COMMUNICATION.MESSAGES.BASE,
        params,
      }),
      providesTags: ['Message'],
    }),

    getMessageById: builder.query<{ success: boolean; message: string; data: Message }, string>({
      query: (id) => API_ENDPOINTS.COMMUNICATION.MESSAGES.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Message', id }],
    }),

    sendMessage: builder.mutation<
      { success: boolean; message: string; data: Message },
      SendMessageRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.COMMUNICATION.MESSAGES.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Message'],
    }),

    markMessageAsRead: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.COMMUNICATION.MESSAGES.MARK_READ(id),
        method: 'PUT',
      }),
      invalidatesTags: ['Message'],
    }),

    getUnreadCount: builder.query<{ unreadCount: number }, UnreadCountParams>({
      query: (params) => ({
        url: API_ENDPOINTS.COMMUNICATION.MESSAGES.UNREAD_COUNT,
        params,
      }),
      providesTags: ['Message'],
    }),

    deleteMessage: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.COMMUNICATION.MESSAGES.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetMessagesQuery,
  useGetMessageByIdQuery,
  useSendMessageMutation,
  useMarkMessageAsReadMutation,
  useGetUnreadCountQuery,
  useDeleteMessageMutation,
} = communicationApi;

