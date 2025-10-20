import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { syncCase } from "../../../../lib/caseService";

const syncCaseInputSchema = z.object({
  cnj: z.string().min(1, "Número CNJ é obrigatório"),
});

export default publicProcedure
  .input(syncCaseInputSchema)
  .mutation(async ({ input }) => {
    console.log(`[tRPC] syncCase called with cnj=${input.cnj}`);
    
    try {
      const lawCase = await syncCase(input.cnj);
      return {
        success: true as const,
        data: lawCase,
      };
    } catch (error) {
      console.error(`[tRPC] syncCase error:`, error);
      
      const message = error instanceof Error ? error.message : "Erro ao sincronizar processo";
      
      return {
        success: false as const,
        error: message,
      };
    }
  });
