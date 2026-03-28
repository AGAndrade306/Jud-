const DATAJUD_BASE_URL = process.env.DATAJUD_BASE_URL || "https://datajud-wiki.cnj.jus.br/api-publica/";
const DATAJUD_TIMEOUT_MS = parseInt(process.env.DATAJUD_TIMEOUT_MS || "15000", 10);

interface RetryConfig {
  maxRetries: number;
  delays: number[];
}

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delays: [500, 1500, 3000],
};

export interface DataJudMovimento {
  codigoNacional?: number;
  nome?: string;
  dataHora?: string;
  complemento?: string;
  nivelSigilo?: number;
}

export interface DataJudProcesso {
  numeroProcesso?: string;
  tribunal?: string;
  movimentos?: DataJudMovimento[];
  [key: string]: unknown;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`[DataJud] Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries} - ${url}`);
      
      const response = await fetchWithTimeout(url, options, DATAJUD_TIMEOUT_MS);

      if (response.status === 429 && attempt < RETRY_CONFIG.maxRetries - 1) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : RETRY_CONFIG.delays[attempt];
        console.log(`[DataJud] Rate limited. Retrying after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`[DataJud] Attempt ${attempt + 1} failed:`, error);

      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const delay = RETRY_CONFIG.delays[attempt];
        console.log(`[DataJud] Retrying after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`DataJud fetch failed after ${RETRY_CONFIG.maxRetries} attempts: ${lastError?.message || "Unknown error"}`);
}

export function validateCNJ(cnj: string): boolean {
  const cleaned = cnj.replace(/\D/g, "");
  const regex = /^\d{7}\d{2}\d{4}\d\d{2}\d{4}$/;
  return regex.test(cleaned);
}

export function normalizeCNJ(cnj: string): string {
  return cnj.replace(/\D/g, "");
}

export async function fetchProcessByCNJ(cnj: string): Promise<DataJudProcesso[]> {
  if (!validateCNJ(cnj)) {
    throw new Error("Número CNJ inválido. Formato esperado: 0000000-00.0000.0.00.0000");
  }

  const normalizedCNJ = normalizeCNJ(cnj);
  
  console.log(`[DataJud] Fetching process: ${normalizedCNJ}`);

  const allMovimentos: DataJudMovimento[] = [];
  let tribunal: string | undefined;
  let page = 0;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const url = `${DATAJUD_BASE_URL}processos/${normalizedCNJ}?pagina=${page}&tamanhoPagina=${pageSize}`;

    try {
      const response = await fetchWithRetry(url);
      const data = await response.json() as DataJudProcesso | DataJudProcesso[];

      const processos = Array.isArray(data) ? data : [data];

      if (processos.length === 0) {
        hasMore = false;
        break;
      }

      for (const processo of processos) {
        if (!tribunal && processo.tribunal) {
          tribunal = processo.tribunal;
        }

        if (processo.movimentos && Array.isArray(processo.movimentos)) {
          allMovimentos.push(...processo.movimentos);
        }
      }

      if (processos.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      console.error(`[DataJud] Error fetching page ${page}:`, error);
      
      if (page === 0) {
        throw error;
      }
      
      hasMore = false;
    }
  }

  console.log(`[DataJud] Fetched ${allMovimentos.length} movimentos for process ${normalizedCNJ}`);

  return [{
    numeroProcesso: normalizedCNJ,
    tribunal,
    movimentos: allMovimentos,
  }];
}
