import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, Circle, Hourglass } from "lucide-react-native";
import { StageKey } from "@/types/case";
import { STAGE_ORDER, STAGES_CONFIG, getStageStatus } from "@/constants/stages";

interface TimelineProps {
  currentStage: StageKey;
  compact?: boolean;
}

export default function Timeline({ currentStage, compact = false }: TimelineProps) {
  return (
    <View style={styles.container}>
      {STAGE_ORDER.map((stageKey, index) => {
        const stage = STAGES_CONFIG[stageKey];
        const status = getStageStatus(stageKey, currentStage);
        const isLast = index === STAGE_ORDER.length - 1;

        return (
          <View key={stageKey} style={styles.stageContainer}>
            <View style={styles.stageRow}>
              <View style={styles.iconColumn}>
                <View
                  style={[
                    styles.iconCircle,
                    status === "completed" && styles.iconCircleCompleted,
                    status === "current" && styles.iconCircleCurrent,
                    status === "next" && styles.iconCircleNext,
                    status === "pending" && styles.iconCirclePending,
                  ]}
                >
                  {status === "completed" && (
                    <CheckCircle2 size={compact ? 20 : 24} color="#10b981" strokeWidth={2.5} />
                  )}
                  {status === "current" && (
                    <Circle size={compact ? 20 : 24} color="#f59e0b" strokeWidth={2.5} fill="#f59e0b" />
                  )}
                  {status === "next" && (
                    <Hourglass size={compact ? 18 : 22} color="#6b7280" strokeWidth={2} />
                  )}
                  {status === "pending" && (
                    <Circle size={compact ? 20 : 24} color="#d1d5db" strokeWidth={2} />
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.connector,
                      status === "completed" && styles.connectorCompleted,
                    ]}
                  />
                )}
              </View>

              <View style={styles.contentColumn}>
                <Text
                  style={[
                    styles.stageTitle,
                    compact && styles.stageTitleCompact,
                    status === "completed" && styles.stageTitleCompleted,
                    status === "current" && styles.stageTitleCurrent,
                  ]}
                >
                  {stage.shortName}
                </Text>
                <Text
                  style={[
                    styles.stageStatus,
                    compact && styles.stageStatusCompact,
                    status === "completed" && styles.stageStatusCompleted,
                    status === "current" && styles.stageStatusCurrent,
                    status === "next" && styles.stageStatusNext,
                  ]}
                >
                  {status === "completed" && "Concluído"}
                  {status === "current" && "Em andamento"}
                  {status === "next" && "Próximo passo"}
                  {status === "pending" && "Pendente"}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stageContainer: {
    marginBottom: 4,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconColumn: {
    alignItems: "center",
    paddingTop: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  iconCircleCompleted: {
    backgroundColor: "#f0fdf4",
  },
  iconCircleCurrent: {
    backgroundColor: "#fffbeb",
  },
  iconCircleNext: {
    backgroundColor: "#f9fafb",
  },
  iconCirclePending: {
    backgroundColor: "#f9fafb",
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 48,
    backgroundColor: "#e5e7eb",
  },
  connectorCompleted: {
    backgroundColor: "#10b981",
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  stageTitleCompact: {
    fontSize: 15,
  },
  stageTitleCompleted: {
    color: "#10b981",
  },
  stageTitleCurrent: {
    color: "#f59e0b",
  },
  stageStatus: {
    fontSize: 14,
    color: "#6b7280",
  },
  stageStatusCompact: {
    fontSize: 13,
  },
  stageStatusCompleted: {
    color: "#10b981",
  },
  stageStatusCurrent: {
    color: "#f59e0b",
  },
  stageStatusNext: {
    color: "#6b7280",
  },
});
