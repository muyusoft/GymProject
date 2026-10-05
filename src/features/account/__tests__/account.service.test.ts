import { describe, expect, it } from "vitest";
import {
  requestPasswordReset,
  signIn,
  signInWithProvider,
  signUp,
} from "../services/account.service";

describe("account.service sin backend", () => {
  it("rechaza toda acción con el motivo unavailable", async () => {
    const credentials = { email: "matheo@example.com", password: "overset1" };

    await expect(signIn(credentials)).rejects.toMatchObject({ code: "unavailable" });
    await expect(signUp({ ...credentials, name: "Matheo" })).rejects.toMatchObject({ code: "unavailable" });
    await expect(signInWithProvider("apple")).rejects.toMatchObject({ code: "unavailable" });
    await expect(requestPasswordReset(credentials.email)).rejects.toMatchObject({ code: "unavailable" });
  });
});
