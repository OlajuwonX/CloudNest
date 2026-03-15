import { account } from "@/lib/appwrite";
import { ID, Models } from "react-native-appwrite";
import { create } from "zustand";

export interface AuthStore {
  /* current authenticated Appwrite user or null when signed out. */
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  /* called once at app startup (inside _layout.tsx).
   * tries to restore an existing Appwrite session by calling account.get().
   * sets user + isAuthenticated, and always clears isLoading when done.
   */
  checkSession: () => Promise<void>;

  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;

  signIn: (email: string, password: string) => Promise<string | null>;

  signOut: () => Promise<string | null>;

  /* directly overwrites the user in the store (for profile updates). */
  setUser: (user: Models.User<Models.Preferences> | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true, // starts as true so the app shows screen1 until checkSession resolves
  isAuthenticated: false,

  checkSession: async () => {
    try {
      const user = await account.get();
      set({ user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (name, email, password) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      set({ user, isAuthenticated: true });
      return null; // Success
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An unknown error occurred during sign-up";
    }
  },

  signIn: async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      set({ user, isAuthenticated: true });
      return null; // Success
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An unknown error occurred during sign-in";
    }
  },

  signOut: async () => {
    try {
      await account.deleteSession("current");
      set({ user: null, isAuthenticated: false });
      return null; // Success
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "An unknown error occurred during sign-out";
    }
  },

  setUser: (user) => set({ user, isAuthenticated: user !== null }),
}));
