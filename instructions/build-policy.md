# Build Policy

- Ne PAS lancer `npm run build` ou `bun run build` après chaque modification.
- Ce projet utilise React + Vite avec HMR (Hot Module Replacement). Les changements côté client sont reflétés en live via le dev server.
- Lancer un build uniquement si :
  - La modification touche du code serveur (API routes, server functions, `*.server.ts`)
  - L'utilisateur le demande explicitement
  - On doit vérifier une erreur de compilation TypeScript spécifique (dans ce cas, préférer `npx tsc --noEmit` plutôt qu'un build complet)
