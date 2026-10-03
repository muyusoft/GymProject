/**
 * Theme store tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "../theme.store";

describe("Theme Store", () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: "auto" });
  });

  it("should initialize with auto theme", () => {
    const state = useThemeStore.getState();
    expect(state.theme).toBe("auto");
  });

  it("should set light theme", () => {
    useThemeStore.getState().setTheme("light");
    const state = useThemeStore.getState();
    expect(state.theme).toBe("light");
  });

  it("should set dark theme", () => {
    useThemeStore.getState().setTheme("dark");
    const state = useThemeStore.getState();
    expect(state.theme).toBe("dark");
  });

  it("should toggle between themes", () => {
    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");

    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");

    useThemeStore.getState().setTheme("auto");
    expect(useThemeStore.getState().theme).toBe("auto");
  });

  it("should have setTheme function", () => {
    const state = useThemeStore.getState();
    expect(typeof state.setTheme).toBe("function");
  });
});
