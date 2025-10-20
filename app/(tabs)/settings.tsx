import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  User,
  Mail,
  MessageCircle,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUserPreferences, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login" as any);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Configurações",
          headerLargeTitle: true,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.profileIcon}>
                <User size={24} color="#2563eb" strokeWidth={2} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Mail size={20} color="#6b7280" strokeWidth={2} />
                <Text style={styles.settingLabel}>E-mail</Text>
              </View>
              <Switch
                value={user?.emailOptIn}
                onValueChange={(value) =>
                  updateUserPreferences({ emailOptIn: value })
                }
                trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                thumbColor={user?.emailOptIn ? "#2563eb" : "#f3f4f6"}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MessageCircle size={20} color="#6b7280" strokeWidth={2} />
                <Text style={styles.settingLabel}>WhatsApp</Text>
              </View>
              <Switch
                value={user?.whatsappOptIn}
                onValueChange={(value) =>
                  updateUserPreferences({ whatsappOptIn: value })
                }
                trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                thumbColor={user?.whatsappOptIn ? "#2563eb" : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <LogOut size={20} color="#ef4444" strokeWidth={2} />
                <Text style={[styles.settingLabel, styles.logoutText]}>
                  Sair da Conta
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.version}>Versão 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  profileEmail: {
    fontSize: 15,
    color: "#6b7280",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginLeft: 48,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  logoutText: {
    color: "#ef4444",
  },
  version: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 16,
  },
});
