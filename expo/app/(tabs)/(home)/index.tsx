import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter, Stack } from "expo-router";
import { Search } from "lucide-react-native";
import { useCases } from "@/contexts/CasesContext";
import Timeline from "@/components/Timeline";

export default function HomeScreen() {
  const router = useRouter();
  const { searchCase } = useCases();
  const insets = useSafeAreaInsets();
  const [cnjNumber, setCnjNumber] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const formatCNJ = (text: string) => {
    const numbers = text.replace(/\D/g, "");
    if (numbers.length <= 7) return numbers;
    if (numbers.length <= 9) return `${numbers.slice(0, 7)}-${numbers.slice(7)}`;
    if (numbers.length <= 13)
      return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9)}`;
    if (numbers.length <= 14)
      return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13)}`;
    if (numbers.length <= 16)
      return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14)}`;
    return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14, 16)}.${numbers.slice(16, 20)}`;
  };

  const handleSearch = async () => {
    const numbers = cnjNumber.replace(/\D/g, "");
    
    if (numbers.length !== 20) {
      Alert.alert("Erro", "Digite um número de processo válido (20 dígitos)");
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchCase(cnjNumber);
      setIsSearching(false);

      if (result) {
        router.push(`/(tabs)/(home)/case-result?caseId=${result.id}&isNew=true` as any);
      } else {
        Alert.alert(
          "Erro ao consultar",
          "Não foi possível consultar o processo. Tente novamente mais tarde."
        );
      }
    } catch (error) {
      setIsSearching(false);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao consultar o processo. Tente novamente mais tarde."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.title}>
            Acompanhe seu Processo{"\n"}Trabalhista em Tempo Real
          </Text>
          <Text style={styles.subtitle}>
            Tenha clareza sobre cada etapa do seu processo.
          </Text>
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.searchLabel}>Digite o nº do processo</Text>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="0000000-00.0000.0.00.0000"
              placeholderTextColor="#9ca3af"
              value={cnjNumber}
              onChangeText={(text) => setCnjNumber(formatCNJ(text))}
              keyboardType="number-pad"
              maxLength={29}
              editable={!isSearching}
            />
          </View>
          <TouchableOpacity
            style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isSearching}
            activeOpacity={0.9}
          >
            {isSearching ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.searchButtonText}>Consultar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.exampleSection}>
          <Text style={styles.exampleTitle}>Exemplo de Acompanhamento</Text>
          <Text style={styles.exampleDescription}>
            Veja como ficará o acompanhamento do seu processo:
          </Text>
          <View style={styles.timelineCard}>
            <Timeline currentStage="AGUARDAR_MANIFESTACAO" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: "#6b7280",
    lineHeight: 26,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  searchLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  searchButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  exampleSection: {
    paddingHorizontal: 24,
  },
  exampleTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  exampleDescription: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 20,
    lineHeight: 22,
  },
  timelineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
