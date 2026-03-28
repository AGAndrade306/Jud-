export type StageKey =
  | "PETICAO_INICIAL"
  | "PRIMEIRA_AUDIENCIA"
  | "AGUARDAR_MANIFESTACAO"
  | "AGUARDAR_DECISAO_JUIZ"
  | "SENTENCA_FINAL";

export type StageStatus = "completed" | "current" | "next" | "pending";

export type TimelineStageStatus = "DONE" | "IN_PROGRESS" | "NEXT" | "PENDING";

export type TimelineStageId =
  | "initial-petition"
  | "first-hearing"
  | "awaiting-manifestation"
  | "awaiting-decision"
  | "final-sentence";

export interface TimelineStage {
  id: TimelineStageId;
  title: string;
  status: TimelineStageStatus;
  date?: string;
  details?: string;
}

export interface DataJudCaseEvent {
  id: string;
  code?: number;
  name: string;
  date?: string;
  court?: string;
  raw: unknown;
}

export interface LawCase {
  id: string;
  cnjNumber: string;
  court?: string;
  currentStage?: TimelineStageId;
  stages: TimelineStage[];
  events: DataJudCaseEvent[];
  createdAt: string;
  lastSyncedAt: string;
}

export interface StageConfig {
  key: StageKey;
  displayName: string;
  shortName: string;
  avgDaysMin: number;
  avgDaysMax: number;
  helpText: string;
  actionRequired: boolean;
  actionText?: string;
  nextStepNote?: string;
}

export interface CaseEvent {
  id: string;
  date: string;
  eventType: string;
  description: string;
  mappedStage?: StageKey;
}

export interface Case {
  id: string;
  cnjNumber: string;
  nickname?: string;
  currentStage: StageKey;
  currentStageUpdatedAt: string;
  lastSyncedAt: string;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  createdAt: string;
  events: CaseEvent[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  whatsappOptIn: boolean;
  emailOptIn: boolean;
}
