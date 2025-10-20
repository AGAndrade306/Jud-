import type { LawCase } from "../../types/case";

class CaseStore {
  private cases: Map<string, LawCase> = new Map();

  async save(lawCase: LawCase): Promise<LawCase> {
    this.cases.set(lawCase.cnjNumber, lawCase);
    console.log(`[CaseStore] Saved case ${lawCase.cnjNumber}`);
    return lawCase;
  }

  async findByCNJ(cnj: string): Promise<LawCase | null> {
    const lawCase = this.cases.get(cnj) || null;
    console.log(`[CaseStore] Find case ${cnj}: ${lawCase ? "found" : "not found"}`);
    return lawCase;
  }

  async update(cnj: string, updates: Partial<LawCase>): Promise<LawCase | null> {
    const existing = this.cases.get(cnj);
    if (!existing) {
      console.log(`[CaseStore] Update failed: case ${cnj} not found`);
      return null;
    }

    const updated: LawCase = {
      ...existing,
      ...updates,
      cnjNumber: existing.cnjNumber,
      id: existing.id,
    };

    this.cases.set(cnj, updated);
    console.log(`[CaseStore] Updated case ${cnj}`);
    return updated;
  }

  async delete(cnj: string): Promise<boolean> {
    const deleted = this.cases.delete(cnj);
    console.log(`[CaseStore] Delete case ${cnj}: ${deleted ? "success" : "not found"}`);
    return deleted;
  }

  async list(): Promise<LawCase[]> {
    return Array.from(this.cases.values());
  }
}

export const caseStore = new CaseStore();
