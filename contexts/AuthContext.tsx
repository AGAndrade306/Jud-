import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback, useMemo } from "react";
import { User } from "@/types/case";

const AUTH_STORAGE_KEY = "@app:auth";
const USER_STORAGE_KEY = "@app:user";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      console.log("[AuthContext] Loading auth state...");
      const [authData, onboardingData] = await Promise.all([
        AsyncStorage.getItem(USER_STORAGE_KEY),
        AsyncStorage.getItem("@app:onboarding"),
      ]);

      if (authData) {
        const userData = JSON.parse(authData);
        console.log("[AuthContext] User loaded:", userData.email);
        setUser(userData);
      }

      if (onboardingData === "completed") {
        setHasCompletedOnboarding(true);
      }
    } catch (error) {
      console.error("[AuthContext] Error loading auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem("@app:onboarding", "completed");
      setHasCompletedOnboarding(true);
      console.log("[AuthContext] Onboarding completed");
    } catch (error) {
      console.error("[AuthContext] Error completing onboarding:", error);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      console.log("[AuthContext] Signing up user:", email);

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        whatsappOptIn: false,
        emailOptIn: true,
      };

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
      setUser(newUser);
      console.log("[AuthContext] Signup successful");
      return { success: true };
    } catch (error) {
      console.error("[AuthContext] Signup error:", error);
      return { success: false, error: "Erro ao criar conta" };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log("[AuthContext] Logging in user:", email);

      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);

      if (!userData) {
        return { success: false, error: "Usuário não encontrado" };
      }

      const user: User = JSON.parse(userData);

      if (user.email !== email) {
        return { success: false, error: "Email ou senha incorretos" };
      }

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "authenticated");
      setUser(user);
      console.log("[AuthContext] Login successful");
      return { success: true };
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      return { success: false, error: "Erro ao fazer login" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log("[AuthContext] Logging out...");
      await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, USER_STORAGE_KEY]);
      setUser(null);
      console.log("[AuthContext] Logout successful");
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
    }
  }, []);

  const updateUserPreferences = useCallback(async (
    preferences: Partial<Pick<User, "whatsappOptIn" | "emailOptIn" | "name">>
  ) => {
    try {
      if (!user) return;

      const updatedUser = { ...user, ...preferences };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log("[AuthContext] User preferences updated");
    } catch (error) {
      console.error("[AuthContext] Error updating preferences:", error);
    }
  }, [user]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      console.log("[AuthContext] Password reset requested for:", email);
      return { success: true, message: "Email de recuperação enviado" };
    } catch (error) {
      console.error("[AuthContext] Reset password error:", error);
      return { success: false, error: "Erro ao enviar email" };
    }
  }, []);

  return useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      hasCompletedOnboarding,
      completeOnboarding,
      signup,
      login,
      logout,
      updateUserPreferences,
      resetPassword,
    }),
    [
      user,
      isLoading,
      hasCompletedOnboarding,
      completeOnboarding,
      signup,
      login,
      logout,
      updateUserPreferences,
      resetPassword,
    ]
  );
});
