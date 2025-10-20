import type { LawCase } from "../../types/case";
import { fetchProcessByCNJ, normalizeCNJ } from "./datajudClient";
import { normalizeEvents, buildTimeline } from "./timelineMapper";
import { caseStore } from "./caseStore";
import { createHash } from "crypto";

function generateCaseId(cnj: string): string {
  return createHash("sha256").update(cnj).digest("hex").substring(0, 12);
}

export async function upsertCaseFromDataJud(cnj: string, forceSync = false): Promise<LawCase> {
  const normalizedCNJ = normalizeCNJ(cnj);
  
  console.log(`[CaseService] Upserting case ${normalizedCNJ}, forceSync=${forceSync}`);

  const existing = await caseStore.findByCNJ(normalizedCNJ);

  if (existing && !forceSync) {
    console.log(`[CaseService] Returning existing case ${normalizedCNJ}`);
    return existing;
  }

  let processos;
  try {
    processos = await fetchProcessByCNJ(normalizedCNJ);
  } catch (error) {
    console.error(`[CaseService] Failed to fetch from DataJud:`, error);
    
    if (existing) {
      console.log(`[CaseService] Returning stale case data for ${normalizedCNJ}`);
      return existing;
    }
    
    throw error;
  }

  if (processos.length === 0) {
    throw new Error("Processo não encontrado no DataJud");
  }

  const processo = processos[0];
  const court = processo.tribunal;
  const movimentos = processo.movimentos || [];

  const events = normalizeEvents(movimentos, normalizedCNJ, court);
  const { stages, currentStage } = buildTimeline(events);

  const now = new Date().toISOString();

  const lawCase: LawCase = {
    id: existing?.id || generateCaseId(normalizedCNJ),
    cnjNumber: normalizedCNJ,
    court,
    currentStage,
    stages,
    events,
    createdAt: existing?.createdAt || now,
    lastSyncedAt: now,
  };

  if (existing) {
    const hasNewEvents = events.some(
      event => !existing.events.some(e => e.id === event.id)
    );
    const stageChanged = existing.currentStage !== currentStage;

    if (hasNewEvents || stageChanged) {
      console.log(`[CaseService] Case ${normalizedCNJ} updated: hasNewEvents=${hasNewEvents}, stageChanged=${stageChanged}`);
    }

    const mergedEvents = [...existing.events];
    for (const event of events) {
      if (!mergedEvents.some(e => e.id === event.id)) {
        mergedEvents.push(event);
      }
    }

    mergedEvents.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (a.date && !b.date) return -1;
      if (!a.date && b.date) return 1;
      return 0;
    });

    lawCase.events = mergedEvents;
  }

  await caseStore.save(lawCase);
  
  console.log(`[CaseService] Case ${normalizedCNJ} upserted successfully`);
  
  return lawCase;
}

export async function getCase(cnj: string): Promise<LawCase | null> {
  const normalizedCNJ = normalizeCNJ(cnj);
  return await caseStore.findByCNJ(normalizedCNJ);
}

export async function syncCase(cnj: string): Promise<LawCase> {
  return await upsertCaseFromDataJud(cnj, true);
}

export async function searchByCNJ(cnj: string): Promise<LawCase> {
  return await upsertCaseFromDataJud(cnj, false);
}
