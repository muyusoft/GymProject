import { create } from "zustand";
import { persistedStore } from "./middleware";

export type PermissionType = "camera" | "location" | "contacts" | "calendar";

interface PermissionsStore {
  permissions: Record<PermissionType, boolean>;
  grantPermission: (permission: PermissionType) => void;
  revokePermission: (permission: PermissionType) => void;
}

export const usePermissionsStore = create<PermissionsStore>(
  persistedStore("permissions", (set) => ({
    permissions: {
      camera: false,
      location: false,
      contacts: false,
      calendar: false,
    },
    grantPermission: (permission) =>
      set((state) => ({
        permissions: { ...state.permissions, [permission]: true },
      })),
    revokePermission: (permission) =>
      set((state) => ({
        permissions: { ...state.permissions, [permission]: false },
      })),
  })),
);
