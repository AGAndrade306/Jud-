import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getCase } from "../../../../lib/caseService";

const getCaseInputSchema = z.object({
  cnj: z.string().min(1, "Número CNJ é obrigatório"),
});

export default publicProcedure
  .input(getCaseInputSchema)
  .query(async ({ input }) => {
    console.log(`[tRPC] getCase called with cnj=${input.cnj}`);
    
    const lawCase = await getCase(input.cnj);
    
    if (!lawCase) {
      return {
        success: false as const,
        error: "Processo não encontrado. Use searchByCNJ para consultar.",
      };
    }
    
    return {
      success: true as const,
      data: lawCase,
    };
  });
