import type {
  TimelineStage,
  TimelineStageId,
  TimelineStageStatus,
  DataJudCaseEvent,
} from "../../types/case";
import type { DataJudMovimento } from "./datajudClient";
import { createHash } from "crypto";

interface CodeMapping {
  stageId: TimelineStageId;
  status?: TimelineStageStatus;
}

const CODE_MAP: Record<number, CodeMapping> = {
  313: { stageId: "initial-petition", status: "DONE" },
  383: { stageId: "first-hearing", status: "IN_PROGRESS" },
  384: { stageId: "first-hearing", status: "DONE" },
  246: { stageId: "awaiting-manifestation", status: "IN_PROGRESS" },
  462: { stageId: "awaiting-decision", status: "IN_PROGRESS" },
  525: { stageId: "final-sentence", status: "DONE" },
  11: { stageId: "initial-petition", status: "DONE" },
  12: { stageId: "initial-petition", status: "DONE" },
  193: { stageId: "first-hearing", status: "DONE" },
  194: { stageId: "first-hearing", status: "DONE" },
  60: { stageId: "awaiting-manifestation", status: "IN_PROGRESS" },
  61: { stageId: "awaiting-manifestation", status: "IN_PROGRESS" },
  51: { stageId: "awaiting-decision", status: "IN_PROGRESS" },
  123: { stageId: "final-sentence", status: "DONE" },
};

interface KeywordMapping {
  test: RegExp;
  stageId: TimelineStageId;
  status: TimelineStageStatus;
}

const KEYWORDS: KeywordMapping[] = [
  { test: /peti(c|ç)[aã]o\s*inicial/i, stageId: "initial-petition", status: "DONE" },
  { test: /distribu[íi](d|ç)[aã]o/i, stageId: "initial-petition", status: "DONE" },
  { test: /audi[eê]ncia.*designad/i, stageId: "first-hearing", status: "IN_PROGRESS" },
  { test: /audi[eê]ncia.*marcad/i, stageId: "first-hearing", status: "IN_PROGRESS" },
  { test: /audi[eê]ncia.*realizad/i, stageId: "first-hearing", status: "DONE" },
  { test: /audi[eê]ncia.*encerrad/i, stageId: "first-hearing", status: "DONE" },
  { test: /(intima|manifest)/i, stageId: "awaiting-manifestation", status: "IN_PROGRESS" },
  { test: /apresent.*defesa/i, stageId: "awaiting-manifestation", status: "IN_PROGRESS" },
  { test: /contest.*apresentad/i, stageId: "awaiting-manifestation", status: "DONE" },
  { test: /(conclusos.*decis[aã]o|aguardar\s*decis[aã]o)/i, stageId: "awaiting-decision", status: "IN_PROGRESS" },
  { test: /remessa.*conclus[aã]o/i, stageId: "awaiting-decision", status: "IN_PROGRESS" },
  { test: /senten[çc]a\s*(proferida|publicada)/i, stageId: "final-sentence", status: "DONE" },
  { test: /tr[âa]nsito.*julgado/i, stageId: "final-sentence", status: "DONE" },
];

const STAGE_ORDER: TimelineStageId[] = [
  "initial-petition",
  "first-hearing",
  "awaiting-manifestation",
  "awaiting-decision",
  "final-sentence",
];

const STAGE_TITLES: Record<TimelineStageId, string> = {
  "initial-petition": "Petição Inicial",
  "first-hearing": "Primeira Audiência",
  "awaiting-manifestation": "Aguardar Manifestação",
  "awaiting-decision": "Aguardar Decisão do Juiz",
  "final-sentence": "Sentença Final",
};

function generateEventId(cnj: string, code: number | undefined, date: string | undefined, name: string): string {
  const data = `${cnj}-${code || ""}-${date || ""}-${name}`;
  return createHash("sha256").update(data).digest("hex").substring(0, 16);
}

export function normalizeEvents(raw: DataJudMovimento[], cnj: string, court?: string): DataJudCaseEvent[] {
  const events: DataJudCaseEvent[] = raw.map((mov, index) => {
    const name = mov.nome || "Movimento sem descrição";
    const date = mov.dataHora;
    const code = mov.codigoNacional;

    return {
      id: generateEventId(cnj, code, date, name),
      code,
      name,
      date: date ? new Date(date).toISOString() : undefined,
      court,
      raw: mov,
    };
  });

  events.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return 0;
  });

  const seen = new Set<string>();
  return events.filter(event => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

interface StageMapping {
  stageId: TimelineStageId;
  status: TimelineStageStatus;
  date?: string;
  eventName: string;
}

function mapEventToStage(event: DataJudCaseEvent): StageMapping | null {
  if (event.code && CODE_MAP[event.code]) {
    const mapping = CODE_MAP[event.code];
    return {
      stageId: mapping.stageId,
      status: mapping.status || "IN_PROGRESS",
      date: event.date,
      eventName: event.name,
    };
  }

  for (const keyword of KEYWORDS) {
    if (keyword.test.test(event.name)) {
      return {
        stageId: keyword.stageId,
        status: keyword.status,
        date: event.date,
        eventName: event.name,
      };
    }
  }

  return null;
}

export function buildTimeline(events: DataJudCaseEvent[]): {
  stages: TimelineStage[];
  currentStage?: TimelineStageId;
} {
  const stageMap = new Map<TimelineStageId, StageMapping[]>();

  for (const event of events) {
    const mapping = mapEventToStage(event);
    if (mapping) {
      if (!stageMap.has(mapping.stageId)) {
        stageMap.set(mapping.stageId, []);
      }
      stageMap.get(mapping.stageId)!.push(mapping);
    }
  }

  let currentStageId: TimelineStageId | undefined;
  let currentStageIndex = -1;

  for (let i = 0; i < STAGE_ORDER.length; i++) {
    const stageId = STAGE_ORDER[i];
    if (stageMap.has(stageId)) {
      currentStageId = stageId;
      currentStageIndex = i;
    }
  }

  const stages: TimelineStage[] = STAGE_ORDER.map((stageId, index) => {
    const stageMappings = stageMap.get(stageId);
    let status: TimelineStageStatus;
    let date: string | undefined;
    let details: string | undefined;

    if (!stageMappings || stageMappings.length === 0) {
      if (index < currentStageIndex) {
        status = "DONE";
      } else if (index === currentStageIndex + 1) {
        status = "NEXT";
      } else {
        status = "PENDING";
      }
    } else {
      const lastMapping = stageMappings[stageMappings.length - 1];
      date = lastMapping.date;

      if (index < currentStageIndex) {
        status = "DONE";
      } else if (index === currentStageIndex) {
        const isDone = stageMappings.some(m => m.status === "DONE");
        status = isDone ? "DONE" : "IN_PROGRESS";
      } else if (index === currentStageIndex + 1) {
        status = "NEXT";
      } else {
        status = "PENDING";
      }

      const eventNames = stageMappings.slice(-2).map(m => m.eventName).join("; ");
      details = eventNames;
    }

    return {
      id: stageId,
      title: STAGE_TITLES[stageId],
      status,
      date,
      details,
    };
  });

  if (events.length === 0) {
    stages.forEach(stage => {
      stage.details = "Dados indisponíveis (sigilo ou sem movimentos)";
    });
  }

  return {
    stages,
    currentStage: currentStageId,
  };
}
