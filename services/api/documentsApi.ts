import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface Document {
  _id: string;
  studentId?: string;
  staffId?: string;
  documentType: 'ID_PROOF' | 'ADDRESS_PROOF' | 'EDUCATION_CERTIFICATE' | 'OTHER';
  fileUrl: string;
  expiryDate?: string;
  adminId: string;
  libraryId: string;
  isVerified?: boolean;
  verificationNotes?: string;
}

export interface CreateDocumentRequest {
  studentId?: string;
  staffId?: string;
  documentType: Document['documentType'];
  fileUrl: string;
  expiryDate?: string;
  adminId: string;
  libraryId: string;
}

export interface GetDocumentsParams {
  adminId: string;
  libraryId: string;
  studentId?: string;
  staffId?: string;
  documentType?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface DocumentsResponse {
  success: boolean;
  message: string;
  data: Document[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all documents
    getDocuments: builder.query<DocumentsResponse, GetDocumentsParams>({
      query: (params) => ({
        url: API_ENDPOINTS.DOCUMENTS.BASE,
        params,
      }),
      providesTags: ['Document'],
    }),

    // Get document by ID
    getDocumentById: builder.query<{ success: boolean; message: string; data: Document }, string>({
      query: (id) => API_ENDPOINTS.DOCUMENTS.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Document', id }],
    }),

    // Create document
    createDocument: builder.mutation<
      { success: boolean; message: string; data: Document },
      CreateDocumentRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.DOCUMENTS.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Document'],
    }),

    // Update document
    updateDocument: builder.mutation<
      { success: boolean; message: string; data: Document },
      { id: string; data: Partial<CreateDocumentRequest> }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.DOCUMENTS.BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Document', id }],
    }),

    // Verify document
    verifyDocument: builder.mutation<
      { success: boolean; message: string; data: Document },
      { id: string; adminId: string; isVerified: boolean; verificationNotes?: string }
    >({
      query: ({ id, adminId, isVerified, verificationNotes }) => ({
        url: API_ENDPOINTS.DOCUMENTS.VERIFY(id),
        method: 'PUT',
        params: { adminId },
        body: { isVerified, verificationNotes },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Document', id }],
    }),

    // Get expiring documents
    getExpiringDocuments: builder.query<
      { success: boolean; message: string; data: Document[] },
      { libraryId: string; adminId: string; days?: number }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.DOCUMENTS.EXPIRING,
        params,
      }),
      providesTags: ['Document'],
    }),

    // Delete document
    deleteDocument: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.DOCUMENTS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useVerifyDocumentMutation,
  useGetExpiringDocumentsQuery,
  useDeleteDocumentMutation,
} = documentsApi;

