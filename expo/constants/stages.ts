import { StageConfig, StageKey } from "@/types/case";

export const STAGES_CONFIG: Record<StageKey, StageConfig> = {
  PETICAO_INICIAL: {
    key: "PETICAO_INICIAL",
    displayName: "Petição Inicial",
    shortName: "Petição Inicial",
    avgDaysMin: 0,
    avgDaysMax: 7,
    helpText:
      "A petição inicial foi protocolada. Esta é a primeira etapa do processo, onde sua demanda foi oficialmente apresentada à Justiça do Trabalho.",
    actionRequired: false,
    nextStepNote:
      "O processo seguirá para análise e será agendada a primeira audiência.",
  },
  PRIMEIRA_AUDIENCIA: {
    key: "PRIMEIRA_AUDIENCIA",
    displayName: "Primeira Audiência",
    shortName: "Primeira Audiência",
    avgDaysMin: 30,
    avgDaysMax: 90,
    helpText:
      "A primeira audiência foi realizada ou está agendada. Nesta etapa, ambas as partes se encontram perante o juiz para uma tentativa de acordo ou início da instrução processual.",
    actionRequired: false,
    nextStepNote:
      "Após a audiência, aguardamos as manifestações das partes ou a designação de nova data.",
  },
  AGUARDAR_MANIFESTACAO: {
    key: "AGUARDAR_MANIFESTACAO",
    displayName: "Aguardar Manifestação da Outra Parte",
    shortName: "Aguardar Manifestação",
    avgDaysMin: 15,
    avgDaysMax: 30,
    helpText:
      "Seu processo está no momento em que a parte contrária precisa se manifestar. Pode ser uma contestação, uma réplica ou uma apresentação de provas.",
    actionRequired: false,
    actionText: "Não é necessário agir neste momento. Aguarde.",
    nextStepNote:
      "Assim que a outra parte se manifestar, o processo seguirá para análise do juiz.",
  },
  AGUARDAR_DECISAO_JUIZ: {
    key: "AGUARDAR_DECISAO_JUIZ",
    displayName: "Aguardar Decisão do Juiz",
    shortName: "Aguardar Decisão",
    avgDaysMin: 30,
    avgDaysMax: 60,
    helpText:
      "O juiz está analisando as provas e argumentos apresentados pelas partes. Esta etapa pode incluir despachos, decisões interlocutórias ou preparação da sentença.",
    actionRequired: false,
    actionText: "Não é necessário agir neste momento. Aguarde.",
    nextStepNote:
      "O próximo passo será a publicação da sentença ou uma decisão intermediária.",
  },
  SENTENCA_FINAL: {
    key: "SENTENCA_FINAL",
    displayName: "Sentença Final",
    shortName: "Sentença Final",
    avgDaysMin: 0,
    avgDaysMax: 0,
    helpText:
      "A sentença foi proferida. Esta é a decisão final do juiz sobre o seu processo. A partir daqui, é possível entrar com recurso se necessário.",
    actionRequired: true,
    actionText: "Consulte seu advogado sobre a sentença e próximos passos.",
    nextStepNote: "Se houver recurso, o processo seguirá para instâncias superiores.",
  },
};

export const STAGE_ORDER: StageKey[] = [
  "PETICAO_INICIAL",
  "PRIMEIRA_AUDIENCIA",
  "AGUARDAR_MANIFESTACAO",
  "AGUARDAR_DECISAO_JUIZ",
  "SENTENCA_FINAL",
];

export function getStageStatus(
  stageKey: StageKey,
  currentStage: StageKey
): "completed" | "current" | "next" | "pending" {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const stageIndex = STAGE_ORDER.indexOf(stageKey);

  if (stageIndex < currentIndex) return "completed";
  if (stageIndex === currentIndex) return "current";
  if (stageIndex === currentIndex + 1) return "next";
  return "pending";
}
