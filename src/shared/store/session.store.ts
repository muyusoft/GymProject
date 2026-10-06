import { create } from "zustand";

export type SessionStatus = "loading" | "signedOut" | "signedIn";

export interface SessionUser {
  id: string;
  email: string | null;
  /** El nombre que dio al crear la cuenta; null si no lo hay. */
  name: string | null;
}

interface SessionState {
  /** "loading" hasta que se lee la sesión guardada al arrancar. */
  status: SessionStatus;
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
}

/** Quién tiene sesión iniciada. Lo mantiene al día `watchSession`; las pantallas solo lo leen. */
export const useSessionStore = create<SessionState>((set) => ({
  status: "loading",
  user: null,
  setUser: (user) => set({ user, status: user ? "signedIn" : "signedOut" }),
}));
