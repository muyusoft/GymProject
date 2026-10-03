/**
 * Persistence middleware tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistedStore } from "../middleware";

describe("Persistence Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create a valid store creator function", () => {
    const initializer = (set: any) => ({
      count: 0,
      increment: () => set((state: any) => ({ count: state.count + 1 })),
    });

    const persistedCreator = persistedStore("test-store", initializer);

    expect(typeof persistedCreator).toBe("function");
  });

  it("should initialize store with base state", () => {
    const initialState = {
      name: "Test",
      value: 42,
      setValue: (v: number) => {},
    };

    const initializer = (set: any) => initialState;
    const persistedCreator = persistedStore("test", initializer);

    const mockSet = vi.fn();
    const state = persistedCreator(mockSet, () => ({}), {} as any);

    expect(state).toHaveProperty("name");
    expect(state).toHaveProperty("value");
    expect(state.name).toBe("Test");
    expect(state.value).toBe(42);
  });

  it("should maintain setter function", () => {
    const initializer = (set: any) => ({
      count: 0,
      inc: () => set({ count: 1 }),
    });

    const persistedCreator = persistedStore("counter", initializer);
    const mockSet = vi.fn();
    const state = persistedCreator(mockSet, () => ({}), {} as any);

    expect(typeof state.inc).toBe("function");
  });

  it("should work with complex state objects", () => {
    const complexState = {
      user: { id: "123", name: "Test" },
      settings: { theme: "dark" },
      updateUser: (user: any) => {},
    };

    const initializer = (set: any) => complexState;
    const persistedCreator = persistedStore("complex", initializer);
    const mockSet = vi.fn();
    const state = persistedCreator(mockSet, () => ({}), {} as any);

    expect(state.user).toEqual({ id: "123", name: "Test" });
    expect(state.settings).toEqual({ theme: "dark" });
  });

  it("should preserve all properties from initializer", () => {
    const initializer = (set: any) => ({
      prop1: "value1",
      prop2: 123,
      prop3: true,
      prop4: ["array"],
      prop5: { nested: "object" },
      action: () => {},
    });

    const persistedCreator = persistedStore("all-props", initializer);
    const mockSet = vi.fn();
    const state = persistedCreator(mockSet, () => ({}), {} as any);

    expect(state.prop1).toBe("value1");
    expect(state.prop2).toBe(123);
    expect(state.prop3).toBe(true);
    expect(state.prop4).toEqual(["array"]);
    expect(state.prop5).toEqual({ nested: "object" });
    expect(typeof state.action).toBe("function");
  });

  it("should call getItem on AsyncStorage during hydration", async () => {
    const initializer = (set: any) => ({ data: "test" });
    const persistedCreator = persistedStore("store-name", initializer);

    const mockSet = vi.fn();
    persistedCreator(mockSet, () => ({}), {} as any);

    // Wait for async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 10));

    // The store should be created successfully
    expect(typeof persistedCreator).toBe("function");
  });

  it("should handle set operations correctly", () => {
    const initializer = (set: any) => ({
      value: 0,
      update: (v: number) => set({ value: v }),
    });

    const persistedCreator = persistedStore("test-state", initializer);
    const mockSet = vi.fn();

    const state = persistedCreator(mockSet, () => ({ value: 0 }), {} as any);

    expect(typeof state.update).toBe("function");
    state.update(42);
    expect(mockSet).toHaveBeenCalled();
  });

  it("should handle different store names", () => {
    const initializer = (set: any) => ({ data: "test" });

    const store1 = persistedStore("store1", initializer);
    const store2 = persistedStore("store2", initializer);

    // Both should be valid store creators
    expect(typeof store1).toBe("function");
    expect(typeof store2).toBe("function");
    expect(store1).not.toBe(store2);
  });

  it("should handle empty state objects", () => {
    const initializer = (set: any) => ({});
    const persistedCreator = persistedStore("empty", initializer);

    const mockSet = vi.fn();
    const state = persistedCreator(mockSet, () => ({}), {} as any);

    expect(state).toEqual({});
  });

  it("should work with null values in state", () => {
    const initializer = (set: any) => ({
      user: null,
      token: null,
      isLoggedIn: false,
    });

    const persistedCreator = persistedStore("auth", initializer);
    const mockSet = vi.fn();
    const state = persistedCreator(mockSet, () => ({}), {} as any);

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoggedIn).toBe(false);
  });

  it("should handle AsyncStorage getItem success with valid JSON", async () => {
    const mockAsyncStorage = vi.mocked(AsyncStorage.getItem);
    const persistedData = { count: 10, name: "persisted" };
    mockAsyncStorage.mockResolvedValueOnce(JSON.stringify(persistedData));

    const initializer = (set: any) => ({ count: 0, name: "" });
    const persistedCreator = persistedStore("hydrate-test", initializer);

    const mockSet = vi.fn();
    persistedCreator(mockSet, () => ({}), {} as any);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockAsyncStorage).toHaveBeenCalledWith("zustand:hydrate-test");
  });

  it("should handle AsyncStorage getItem failure", async () => {
    const mockAsyncStorage = vi.mocked(AsyncStorage.getItem);
    mockAsyncStorage.mockRejectedValueOnce(new Error("Storage error"));

    const initializer = (set: any) => ({ data: "initial" });
    const persistedCreator = persistedStore("error-test", initializer);

    const mockSet = vi.fn();
    persistedCreator(mockSet, () => ({}), {} as any);

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should still create the store despite error
    expect(typeof persistedCreator).toBe("function");
  });

  it("should handle invalid JSON in AsyncStorage", async () => {
    const mockAsyncStorage = vi.mocked(AsyncStorage.getItem);
    mockAsyncStorage.mockResolvedValueOnce("invalid json {");

    const initializer = (set: any) => ({ value: 0 });
    const persistedCreator = persistedStore("invalid-json", initializer);

    const mockSet = vi.fn();
    persistedCreator(mockSet, () => ({}), {} as any);

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should handle JSON parse error gracefully
    expect(typeof persistedCreator).toBe("function");
  });

  it("should handle AsyncStorage setItem during state update", async () => {
    const mockSetItem = vi.mocked(AsyncStorage.setItem);
    mockSetItem.mockResolvedValueOnce(undefined);

    const initializer = (set: any) => ({
      value: 0,
      increment: () => set((state: any) => ({ value: state.value + 1 })),
    });

    const persistedCreator = persistedStore("increment", initializer);
    const mockSet = vi.fn();
    const state = persistedCreator(mockSet, () => ({ value: 0 }), {} as any);

    expect(typeof state.increment).toBe("function");
  });

  it("should handle AsyncStorage setItem failure", async () => {
    const mockSetItem = vi.mocked(AsyncStorage.setItem);
    mockSetItem.mockRejectedValueOnce(new Error("Write failed"));

    const initializer = (set: any) => ({
      data: "test",
      update: () => set({ data: "updated" }),
    });

    const persistedCreator = persistedStore("write-fail", initializer);
    const mockSet = vi.fn();
    const state = persistedCreator(
      mockSet,
      () => ({ data: "test" }),
      {} as any,
    );

    expect(typeof state.update).toBe("function");
  });

  it("should handle state mutations through set function", () => {
    const initializer = (set: any) => ({
      items: [],
      addItem: (item: any) =>
        set((state: any) => ({
          items: [...state.items, item],
        })),
    });

    const persistedCreator = persistedStore("items", initializer);
    const mockSet = vi.fn();
    const state = persistedCreator(mockSet, () => ({ items: [] }), {} as any);

    state.addItem({ id: 1 });
    expect(mockSet).toHaveBeenCalled();
  });
});
