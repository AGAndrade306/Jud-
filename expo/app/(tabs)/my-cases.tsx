import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { useRouter, Stack } from "expo-router";
import { Search, FolderOpen, ChevronRight } from "lucide-react-native";
import { useCases } from "@/contexts/CasesContext";
import { Case } from "@/types/case";
import { STAGES_CONFIG } from "@/constants/stages";

export default function MyCasesScreen() {
  const router = useRouter();
  const { cases } = useCases();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "current" | "completed">("all");

  const filteredCases = useMemo(() => {
    let filtered = cases;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.cnjNumber.includes(searchQuery) ||
          c.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter === "current") {
      filtered = filtered.filter(
        (c) =>
          c.currentStage !== "SENTENCA_FINAL" && c.currentStage !== "PETICAO_INICIAL"
      );
    } else if (filter === "completed") {
      filtered = filtered.filter((c) => c.currentStage === "SENTENCA_FINAL");
    }

    return filtered;
  }, [cases, searchQuery, filter]);

  const renderCase = (caseItem: Case) => {
    const stage = STAGES_CONFIG[caseItem.currentStage];
    const statusColor =
      caseItem.currentStage === "SENTENCA_FINAL"
        ? "#10b981"
        : caseItem.currentStage === "PETICAO_INICIAL"
        ? "#6b7280"
        : "#f59e0b";

    return (
      <TouchableOpacity
        key={caseItem.id}
        style={styles.caseCard}
        onPress={() =>
          router.push(`/(tabs)/(home)/case-detail?caseId=${caseItem.id}` as any)
        }
        activeOpacity={0.7}
      >
        <View style={styles.caseHeader}>
          <View style={styles.caseInfo}>
            <Text style={styles.caseNumber}>{caseItem.cnjNumber}</Text>
            {caseItem.nickname && (
              <Text style={styles.caseNickname}>{caseItem.nickname}</Text>
            )}
          </View>
          <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
        </View>
        <View style={styles.caseFooter}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {stage.shortName}
            </Text>
          </View>
          <Text style={styles.lastUpdate}>
            Atualizado em{" "}
            {new Date(caseItem.lastSyncedAt).toLocaleDateString("pt-BR")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Meus Processos",
          headerLargeTitle: true,
        }}
      />
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#6b7280" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar processo..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
            onPress={() => setFilter("all")}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterText, filter === "all" && styles.filterTextActive]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "current" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("current")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                filter === "current" && styles.filterTextActive,
              ]}
            >
              Em Andamento
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "completed" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("completed")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                filter === "completed" && styles.filterTextActive,
              ]}
            >
              Concluídos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCases.length > 0 ? (
          filteredCases.map(renderCase)
        ) : (
          <View style={styles.emptyState}>
            <FolderOpen size={64} color="#d1d5db" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Nenhum processo encontrado</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery
                ? "Tente buscar por outro termo"
                : "Consulte um processo na tela inicial para adicioná-lo"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  searchSection: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  filterButtonActive: {
    backgroundColor: "#2563eb",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6b7280",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  caseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  caseInfo: {
    flex: 1,
    gap: 4,
  },
  caseNumber: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  caseNickname: {
    fontSize: 14,
    color: "#6b7280",
  },
  caseFooter: {
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  lastUpdate: {
    fontSize: 13,
    color: "#9ca3af",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
