import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { searchByCNJ } from "../../../../lib/caseService";

const searchByCNJInputSchema = z.object({
  cnj: z.string().min(1, "Número CNJ é obrigatório"),
});

export default publicProcedure
  .input(searchByCNJInputSchema)
  .query(async ({ input }) => {
    console.log(`[tRPC] searchByCNJ called with cnj=${input.cnj}`);
    
    try {
      const lawCase = await searchByCNJ(input.cnj);
      return {
        success: true as const,
        data: lawCase,
      };
    } catch (error) {
      console.error(`[tRPC] searchByCNJ error:`, error);
      
      const message = error instanceof Error ? error.message : "Erro ao consultar processo";
      
      return {
        success: false as const,
        error: message,
      };
    }
  });
