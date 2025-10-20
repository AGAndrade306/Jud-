import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link, Stack } from "expo-router";
import { Home } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Página Não Encontrada" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.message}>Esta página não existe.</Text>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={styles.button} activeOpacity={0.9}>
            <Home size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.buttonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  message: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
});
