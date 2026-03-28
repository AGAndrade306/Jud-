import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MessageCircle, Mail, Save, AlertCircle } from "lucide-react-native";
import { useCases } from "@/contexts/CasesContext";
import { STAGES_CONFIG } from "@/constants/stages";
import Timeline from "@/components/Timeline";

export default function CaseResultScreen() {
  const router = useRouter();
  const { caseId, isNew } = useLocalSearchParams();
  const { getCaseById, addCase } = useCases();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const caseData = getCaseById(caseId as string);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!caseData) {
        setHasError(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [caseData]);

  if (hasError || (!caseData && caseId === "error")) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <AlertCircle size={64} color="#ef4444" strokeWidth={1.5} />
        </View>
        <Text style={styles.errorTitle}>Não foi possível carregar o processo</Text>
        <Text style={styles.errorDescription}>
          A API do DataJud não retornou dados ou está temporariamente indisponível.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
          activeOpacity={0.9}
        >
          <Text style={styles.errorButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Carregando processo...</Text>
      </View>
    );
  }

  const currentStageConfig = STAGES_CONFIG[caseData.currentStage];

  const handleSave = async () => {
    setIsSaving(true);
    const result = await addCase(caseData);
    setIsSaving(false);

    if (result.success) {
      Alert.alert("Sucesso", "Processo salvo com sucesso!", [
        {
          text: "Ver Meus Processos",
          onPress: () => router.push("/(tabs)/my-cases"),
        },
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert("Erro", result.error || "Erro ao salvar processo");
    }
  };

  const handleContactLawyer = () => {
    const phone = "5511999999999";
    const message = encodeURIComponent(
      `Olá! Gostaria de falar sobre o processo ${caseData.cnjNumber}`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  const handleNotifications = () => {
    Alert.alert(
      "Notificações",
      "Deseja receber atualizações sobre este processo?",
      [
        {
          text: "Não",
          style: "cancel",
        },
        {
          text: "Sim, quero receber",
          onPress: () => {
            Alert.alert("Ótimo!", "Você receberá atualizações por e-mail e WhatsApp");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.caseNumber}>{caseData.cnjNumber}</Text>
          {caseData.nickname && (
            <Text style={styles.caseNickname}>{caseData.nickname}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linha do Tempo</Text>
          <View style={styles.timelineCard}>
            <Timeline currentStage={caseData.currentStage} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etapa Atual</Text>
          <View style={styles.currentStageCard}>
            <Text style={styles.currentStageTitle}>
              {currentStageConfig.displayName}
            </Text>
            <Text style={styles.currentStageDescription}>
              {currentStageConfig.helpText}
            </Text>

            <View style={styles.deadlineCard}>
              <Text style={styles.deadlineLabel}>Prazo Médio</Text>
              <Text style={styles.deadlineValue}>
                {currentStageConfig.avgDaysMin === currentStageConfig.avgDaysMax
                  ? `${currentStageConfig.avgDaysMin} dias`
                  : `${currentStageConfig.avgDaysMin}–${currentStageConfig.avgDaysMax} dias`}
              </Text>
              {currentStageConfig.actionText && (
                <Text style={styles.deadlineNote}>
                  {currentStageConfig.actionText}
                </Text>
              )}
            </View>

            {currentStageConfig.nextStepNote && (
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>
                  {currentStageConfig.nextStepNote}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContactLawyer}
            activeOpacity={0.9}
          >
            <MessageCircle size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.primaryButtonText}>
              Falar com um Advogado Agora
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleNotifications}
            activeOpacity={0.9}
          >
            <Mail size={20} color="#2563eb" strokeWidth={2} />
            <Text style={styles.secondaryButtonText}>
              Receber Atualizações por e-mail/WhatsApp
            </Text>
          </TouchableOpacity>
        </View>

        {isNew === "true" && (
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.9}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Save size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.saveButtonText}>Salvar Processo</Text>
              </>
            )}
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    padding: 24,
    gap: 20,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  errorButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 12,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  caseNumber: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  caseNickname: {
    fontSize: 16,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 12,
  },
  timelineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  currentStageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 16,
  },
  currentStageTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1a1a1a",
  },
  currentStageDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  deadlineCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  deadlineLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e40af",
    marginBottom: 4,
  },
  deadlineValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1e40af",
    marginBottom: 8,
  },
  deadlineNote: {
    fontSize: 14,
    color: "#3b82f6",
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  noteText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#2563eb",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
});
