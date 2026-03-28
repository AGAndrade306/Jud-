import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Voltar",
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#1a1a1a",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="case-result"
        options={{
          title: "Resultado da Consulta",
        }}
      />
      <Stack.Screen
        name="case-detail"
        options={{
          title: "Detalhes do Processo",
        }}
      />
    </Stack>
  );
}
