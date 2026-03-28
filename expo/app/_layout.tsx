import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CasesProvider } from "@/contexts/CasesContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";
    const inAuthScreens = ["login", "signup", "forgot-password"].includes(segments[0] || "");
    const inSplash = segments[0] === "splash";

    console.log("[Navigation] State:", { isAuthenticated, hasCompletedOnboarding, segments: segments[0], inAuthGroup, inOnboarding, inAuthScreens, inSplash });

    if (!hasCompletedOnboarding && !inOnboarding) {
      console.log("[Navigation] Redirecting to onboarding");
      router.replace("/onboarding" as any);
    } else if (hasCompletedOnboarding && !isAuthenticated && inAuthGroup) {
      console.log("[Navigation] Redirecting to login (not authenticated in tabs)");
      router.replace("/login" as any);
    } else if (hasCompletedOnboarding && isAuthenticated && inAuthScreens) {
      console.log("[Navigation] Redirecting to tabs (authenticated on auth screen)");
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, segments, router]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Voltar" }}>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <CasesProvider>
              <ChatProvider>
                <RootLayoutNav />
              </ChatProvider>
            </CasesProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
