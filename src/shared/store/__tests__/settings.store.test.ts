import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/config/i18n";
import { getAllSettings, saveSetting } from "@/shared/db/queries/settings.queries";
import { syncReminders } from "@/shared/services/reminders.service";
import { useSettingsStore } from "../settings.store";
import { useThemeStore } from "../theme.store";

vi.mock("@/shared/db/queries/settings.queries", () => ({
  getAllSettings: vi.fn(),
  saveSetting: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/shared/services/reminders.service", () => ({ syncReminders: vi.fn() }));

describe("settings store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({ isHydrated: false, language: "en", theme: "auto" });
  });

  it("hidrata con lo guardado y sincroniza idioma y tema", async () => {
    vi.mocked(getAllSettings).mockResolvedValue({ language: "es", theme: "light" });

    await useSettingsStore.getState().hydrate();

    expect(useSettingsStore.getState()).toMatchObject({
      isHydrated: true,
      language: "es",
      theme: "light",
    });
    expect(i18n.changeLanguage).toHaveBeenCalledWith("es");
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("guarda el cambio antes de reflejarlo", async () => {
    await useSettingsStore.getState().update("weightUnit", "kg");

    expect(saveSetting).toHaveBeenCalledWith("weightUnit", "kg");
    expect(useSettingsStore.getState().weightUnit).toBe("kg");
  });

  it("reprograma los recordatorios al cambiar el recordatorio o el idioma, y solo entonces", async () => {
    await useSettingsStore.getState().update("reminderHour", 7);
    await useSettingsStore.getState().update("language", "en");
    expect(syncReminders).toHaveBeenCalledTimes(2);

    await useSettingsStore.getState().update("trackRpe", true);
    expect(syncReminders).toHaveBeenCalledTimes(2);
  });

  it("no cambia el estado si guardar falla", async () => {
    vi.mocked(saveSetting).mockRejectedValueOnce(new Error("disk full"));

    await expect(useSettingsStore.getState().update("trackRpe", true)).rejects.toThrow("disk full");
    expect(useSettingsStore.getState().trackRpe).toBe(false);
  });
});
