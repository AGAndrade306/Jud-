import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import searchByCNJRoute from "./routes/cases/searchByCNJ/route";
import getCaseRoute from "./routes/cases/getCase/route";
import syncCaseRoute from "./routes/cases/syncCase/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  cases: createTRPCRouter({
    searchByCNJ: searchByCNJRoute,
    getCase: getCaseRoute,
    syncCase: syncCaseRoute,
  }),
});

export type AppRouter = typeof appRouter;
