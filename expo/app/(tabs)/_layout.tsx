import { Tabs } from "expo-router";
import { Home, FolderOpen, Settings, MessageCircle } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="my-cases"
        options={{
          title: "Meus Processos",
          tabBarIcon: ({ color }) => <FolderOpen size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Consultor",
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Configurações",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
