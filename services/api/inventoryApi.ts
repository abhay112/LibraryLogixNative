import { baseApi } from './baseApi';
import { API_ENDPOINTS } from '@/config/api';

export interface InventoryItem {
  _id: string;
  name: string;
  category: 'EQUIPMENT' | 'FURNITURE' | 'STATIONERY' | 'ELECTRONICS' | 'BOOKS' | 'OTHER';
  condition: 'GOOD' | 'NEEDS_REPAIR' | 'DAMAGED' | 'DISPOSED';
  adminId: string;
  libraryId: string;
  quantity?: number;
  location?: string;
}

export interface CreateInventoryRequest {
  name: string;
  category: InventoryItem['category'];
  condition: InventoryItem['condition'];
  adminId: string;
  libraryId: string;
  quantity?: number;
  location?: string;
}

export interface GetInventoryParams {
  adminId: string;
  libraryId: string;
  category?: string;
  condition?: string;
  page?: number;
  limit?: number;
}

export interface InventoryResponse {
  success: boolean;
  message: string;
  data: InventoryItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MaintenanceRecord {
  _id: string;
  itemId: string;
  maintenanceType: 'REPAIR' | 'SERVICE' | 'REPLACEMENT';
  description: string;
  cost?: number;
  date: string;
}

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all inventory items
    getInventory: builder.query<InventoryResponse, GetInventoryParams>({
      query: (params) => ({
        url: API_ENDPOINTS.INVENTORY.BASE,
        params,
      }),
      providesTags: ['Inventory'],
    }),

    // Get inventory item by ID
    getInventoryById: builder.query<{ success: boolean; message: string; data: InventoryItem }, string>({
      query: (id) => API_ENDPOINTS.INVENTORY.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),

    // Create inventory item
    createInventory: builder.mutation<
      { success: boolean; message: string; data: InventoryItem },
      CreateInventoryRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.INVENTORY.BASE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Update inventory item
    updateInventory: builder.mutation<
      { success: boolean; message: string; data: InventoryItem },
      { id: string; data: Partial<CreateInventoryRequest> }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.INVENTORY.BY_ID(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inventory', id }],
    }),

    // Delete inventory item
    deleteInventory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.INVENTORY.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Get items needing maintenance
    getItemsNeedingMaintenance: builder.query<
      { success: boolean; message: string; data: InventoryItem[] },
      { libraryId: string; adminId: string }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.INVENTORY.MAINTENANCE.NEEDED,
        params,
      }),
      providesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryByIdQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useGetItemsNeedingMaintenanceQuery,
} = inventoryApi;

