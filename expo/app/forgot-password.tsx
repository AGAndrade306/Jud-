import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Erro", "Por favor, digite seu e-mail");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        "E-mail Enviado",
        "Verifique sua caixa de entrada para redefinir sua senha",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert("Erro", result.error || "Erro ao enviar e-mail");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Mail size={40} color="#2563eb" strokeWidth={2} />
          </View>
          <Text style={styles.title}>Esqueci Minha Senha</Text>
          <Text style={styles.subtitle}>
            Digite seu e-mail para receber instruções de recuperação
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Enviar E-mail</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>Voltar ao Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#374151",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  backButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6b7280",
  },
});
