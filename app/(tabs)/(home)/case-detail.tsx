import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Edit2, Trash2, Calendar } from "lucide-react-native";
import { useCases } from "@/contexts/CasesContext";
import { STAGES_CONFIG } from "@/constants/stages";
import Timeline from "@/components/Timeline";

export default function CaseDetailScreen() {
  const router = useRouter();
  const { caseId } = useLocalSearchParams();
  const { getCaseById, updateCase, removeCase } = useCases();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>("");

  const caseData = getCaseById(caseId as string);

  if (!caseData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Processo não encontrado</Text>
      </View>
    );
  }

  const currentStageConfig = STAGES_CONFIG[caseData.currentStage];

  const handleSaveNickname = async () => {
    if (nickname.trim()) {
      await updateCase(caseData.id, { nickname: nickname.trim() });
      Alert.alert("Sucesso", "Apelido atualizado");
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Remover Processo",
      "Tem certeza que deseja remover este processo da sua lista?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            await removeCase(caseData.id);
            router.back();
          },
        },
      ]
    );
  };

  const toggleEmailNotifications = async (value: boolean) => {
    await updateCase(caseData.id, { notifyEmail: value });
  };

  const toggleWhatsAppNotifications = async (value: boolean) => {
    await updateCase(caseData.id, { notifyWhatsapp: value });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.caseNumber}>{caseData.cnjNumber}</Text>
          <View style={styles.nicknameSection}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.nicknameInput}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="Digite um apelido"
                  placeholderTextColor="#9ca3af"
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.saveNicknameButton}
                  onPress={handleSaveNickname}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveNicknameText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nicknameRow}
                onPress={() => {
                  setNickname(caseData.nickname || "");
                  setIsEditing(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.nickname}>
                  {caseData.nickname || "Adicionar apelido"}
                </Text>
                <Edit2 size={16} color="#6b7280" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etapa Atual</Text>
          <View style={styles.stageCard}>
            <Text style={styles.stageName}>{currentStageConfig.displayName}</Text>
            <Text style={styles.stageDescription}>
              {currentStageConfig.helpText}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linha do Tempo</Text>
          <View style={styles.timelineCard}>
            <Timeline currentStage={caseData.currentStage} compact />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Andamentos</Text>
          <View style={styles.eventsCard}>
            {caseData.events.map((event, index) => (
              <View key={event.id}>
                <View style={styles.eventRow}>
                  <Calendar size={16} color="#6b7280" strokeWidth={2} />
                  <View style={styles.eventContent}>
                    <Text style={styles.eventDate}>
                      {new Date(event.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                    <Text style={styles.eventType}>{event.eventType}</Text>
                    <Text style={styles.eventDescription}>
                      {event.description}
                    </Text>
                  </View>
                </View>
                {index < caseData.events.length - 1 && (
                  <View style={styles.eventDivider} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <View style={styles.notificationsCard}>
            <View style={styles.notificationRow}>
              <Text style={styles.notificationLabel}>E-mail</Text>
              <Switch
                value={caseData.notifyEmail}
                onValueChange={toggleEmailNotifications}
                trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                thumbColor={caseData.notifyEmail ? "#2563eb" : "#f3f4f6"}
              />
            </View>
            <View style={styles.notificationDivider} />
            <View style={styles.notificationRow}>
              <Text style={styles.notificationLabel}>WhatsApp</Text>
              <Switch
                value={caseData.notifyWhatsapp}
                onValueChange={toggleWhatsAppNotifications}
                trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                thumbColor={caseData.notifyWhatsapp ? "#2563eb" : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color="#ef4444" strokeWidth={2} />
          <Text style={styles.deleteButtonText}>Remover da Minha Lista</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  caseNumber: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  nicknameSection: {
    marginTop: 4,
  },
  nicknameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nickname: {
    fontSize: 15,
    color: "#6b7280",
  },
  editContainer: {
    flexDirection: "row",
    gap: 8,
  },
  nicknameInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: "#1a1a1a",
  },
  saveNicknameButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
  },
  saveNicknameText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 12,
  },
  stageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  stageName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  stageDescription: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  timelineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  eventsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  eventRow: {
    flexDirection: "row",
    gap: 12,
  },
  eventContent: {
    flex: 1,
    gap: 4,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#6b7280",
  },
  eventType: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  eventDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  eventDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
    marginLeft: 28,
  },
  notificationsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  notificationLabel: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  notificationDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#ef4444",
  },
});
