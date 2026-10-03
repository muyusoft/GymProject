/**
 * Permissions store tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import { usePermissionsStore } from "../permissions.store";

describe("Permissions Store", () => {
  beforeEach(() => {
    usePermissionsStore.setState({
      permissions: {
        camera: false,
        location: false,
        contacts: false,
        calendar: false,
      },
    });
  });

  it("should initialize with all permissions false", () => {
    const state = usePermissionsStore.getState();
    expect(state.permissions.camera).toBe(false);
    expect(state.permissions.location).toBe(false);
    expect(state.permissions.contacts).toBe(false);
    expect(state.permissions.calendar).toBe(false);
  });

  it("should grant camera permission", () => {
    usePermissionsStore.getState().grantPermission("camera");
    const state = usePermissionsStore.getState();
    expect(state.permissions.camera).toBe(true);
  });

  it("should grant location permission", () => {
    usePermissionsStore.getState().grantPermission("location");
    const state = usePermissionsStore.getState();
    expect(state.permissions.location).toBe(true);
  });

  it("should grant contacts permission", () => {
    usePermissionsStore.getState().grantPermission("contacts");
    const state = usePermissionsStore.getState();
    expect(state.permissions.contacts).toBe(true);
  });

  it("should grant calendar permission", () => {
    usePermissionsStore.getState().grantPermission("calendar");
    const state = usePermissionsStore.getState();
    expect(state.permissions.calendar).toBe(true);
  });

  it("should revoke permissions", () => {
    usePermissionsStore.getState().grantPermission("camera");
    expect(usePermissionsStore.getState().permissions.camera).toBe(true);

    usePermissionsStore.getState().revokePermission("camera");
    expect(usePermissionsStore.getState().permissions.camera).toBe(false);
  });

  it("should grant multiple permissions independently", () => {
    usePermissionsStore.getState().grantPermission("camera");
    usePermissionsStore.getState().grantPermission("location");

    const state = usePermissionsStore.getState();
    expect(state.permissions.camera).toBe(true);
    expect(state.permissions.location).toBe(true);
    expect(state.permissions.contacts).toBe(false);
    expect(state.permissions.calendar).toBe(false);
  });

  it("should have permission management functions", () => {
    const state = usePermissionsStore.getState();
    expect(typeof state.grantPermission).toBe("function");
    expect(typeof state.revokePermission).toBe("function");
  });
});
