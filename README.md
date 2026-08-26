# Canadian Adventure Camp

The production website and Sanity Studio for Canadian Adventure Camp.

## Local development

Requirements:

- Node.js 24.19.0
- pnpm 11.10.0
- The Canadian Adventure Camp Sanity project ID
- A Sanity API read token
- A Sanity auth token
- An available Studio hostname

Create local environment files, then add the required credentials:

```bash
install -m 600 frontend/.env.local.example frontend/.env.local
install -m 600 studio/.env.local.example studio/.env.local
```

The read token powers Sanity Presentation draft previews. The auth token powers Studio-side CLI jobs and repository-scoped Sanity MCP access in Codex. Add optional integration credentials to the local env files only when the matching feature needs them. The committed `.env.local.example` files list the supported names.

Install dependencies and start both apps:

```bash
pnpm install
pnpm dev
```

- Website: `http://localhost:3000`
- Studio: `http://localhost:3333`

Before using Presentation, confirm the Website and Studio origins are present in the Sanity project's CORS settings.

## Workspace commands

```bash
pnpm dev
pnpm dev:frontend
pnpm dev:studio
pnpm verify
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm typegen
```

Run `pnpm verify` before opening a pull request. It checks generated Sanity types, TypeScript, lint, focused tests, and both production builds.

Use plain pnpm commands from the repository root. Add workspace dependencies with `pnpm --dir frontend add <package>` or `pnpm --dir studio add <package>`.

## Deployment

The Website and Studio deploy separately.

The Vercel project uses `frontend` as its root directory. Keep its environment values in sync with `frontend/.env.local.example`.

Deploy the Studio manually after configuring its hosted environment values:

```bash
pnpm --dir studio deploy
```

See `docs/deployment.md` for the production gate and complete deployment checklist.

## Repository layout

- `frontend/`: Next.js Website
- `studio/`: Sanity Studio, schemas, and functions
- `shared/`: code shared by both workspaces
- `docs/agents/`: repository workflow guidance

Read `docs/content-model.md` for the model map and `docs/agents/page-builder.md` before changing Page Builder sections.

## License

The repository is available under the MIT License.
