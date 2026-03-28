import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Case } from "@/types/case";
import { MOCK_CASES } from "@/mocks/cases";
import { useAuth } from "./AuthContext";

const CASES_STORAGE_KEY = "@app:cases";

export const [CasesProvider, useCases] = createContextHook(() => {
  const { isAuthenticated } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) {
      loadCases();
    } else {
      setCases([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadCases = async () => {
    try {
      console.log("[CasesContext] Loading cases...");
      const stored = await AsyncStorage.getItem(CASES_STORAGE_KEY);

      if (stored) {
        const parsedCases = JSON.parse(stored);
        console.log("[CasesContext] Loaded", parsedCases.length, "cases");
        setCases(parsedCases);
      } else {
        console.log("[CasesContext] No cases found, initializing with mock data");
        setCases(MOCK_CASES);
        await AsyncStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(MOCK_CASES));
      }
    } catch (error) {
      console.error("[CasesContext] Error loading cases:", error);
      setCases(MOCK_CASES);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCases = async (updatedCases: Case[]) => {
    try {
      await AsyncStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(updatedCases));
      setCases(updatedCases);
      console.log("[CasesContext] Cases saved:", updatedCases.length);
    } catch (error) {
      console.error("[CasesContext] Error saving cases:", error);
    }
  };

  const getCaseById = useCallback(
    (id: string): Case | undefined => {
      return cases.find((c) => c.id === id);
    },
    [cases]
  );

  const searchCase = useCallback(async (cnjNumber: string): Promise<Case | null> => {
    try {
      console.log("[CasesContext] Searching for case:", cnjNumber);

      const existing = cases.find((c) => c.cnjNumber === cnjNumber);
      if (existing) {
        console.log("[CasesContext] Case found in saved list");
        return existing;
      }

      const mockCase = MOCK_CASES.find((c) => c.cnjNumber === cnjNumber);
      if (mockCase) {
        console.log("[CasesContext] Case found in mock data");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return mockCase;
      }

      console.log("[CasesContext] Simulating API timeout/error");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      throw new Error("Processo não encontrado na API do DataJud ou API indisponível");
    } catch (error) {
      console.error("[CasesContext] Error searching case:", error);
      throw error;
    }
  }, [cases]);

  const addCase = useCallback(async (newCase: Case) => {
    try {
      const existing = cases.find((c) => c.cnjNumber === newCase.cnjNumber);
      if (existing) {
        console.log("[CasesContext] Case already exists:", newCase.cnjNumber);
        return { success: false, error: "Este processo já está salvo" };
      }

      const updated = [...cases, newCase];
      await saveCases(updated);
      console.log("[CasesContext] Case added:", newCase.cnjNumber);
      return { success: true };
    } catch (error) {
      console.error("[CasesContext] Error adding case:", error);
      return { success: false, error: "Erro ao adicionar processo" };
    }
  }, [cases]);

  const updateCase = useCallback(async (
    id: string,
    updates: Partial<Pick<Case, "nickname" | "notifyEmail" | "notifyWhatsapp">>
  ) => {
    try {
      const updated = cases.map((c) => (c.id === id ? { ...c, ...updates } : c));
      await saveCases(updated);
      console.log("[CasesContext] Case updated:", id);
      return { success: true };
    } catch (error) {
      console.error("[CasesContext] Error updating case:", error);
      return { success: false, error: "Erro ao atualizar processo" };
    }
  }, [cases]);

  const removeCase = useCallback(async (id: string) => {
    try {
      const updated = cases.filter((c) => c.id !== id);
      await saveCases(updated);
      console.log("[CasesContext] Case removed:", id);
      return { success: true };
    } catch (error) {
      console.error("[CasesContext] Error removing case:", error);
      return { success: false, error: "Erro ao remover processo" };
    }
  }, [cases]);

  return useMemo(
    () => ({
      cases,
      isLoading,
      searchQuery,
      setSearchQuery,
      getCaseById,
      searchCase,
      addCase,
      updateCase,
      removeCase,
    }),
    [
      cases,
      isLoading,
      searchQuery,
      setSearchQuery,
      getCaseById,
      searchCase,
      addCase,
      updateCase,
      removeCase,
    ]
  );
});
