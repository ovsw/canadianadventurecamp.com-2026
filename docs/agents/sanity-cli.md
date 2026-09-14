# Sanity CLI

The root Studio deployment command uses Sanity's production mode. Sanity loads
credentials from `studio/.env.local` and deployment settings from
`studio/.env.production`, including the existing Studio app ID:

```bash
pnpm deploy:studio
```

The current Sanity CLI also loads `studio/.env.local` for direct commands. Run
them from the Studio workspace so it can resolve the correct environment:

```bash
pnpm --dir studio exec sanity <command>
```

This applies to all CLI operations: `dataset import`, `dataset export`, `deploy`, `schema extract`, etc.

To read documents, skip the CLI: `pnpm sanity:query '<groq>' ['<json params>']` prints the result as JSON, includes drafts, and loads the token itself.

## Notes

- Tokens are project-scoped. If the project ID changes, generate a new token at `https://www.sanity.io/manage/project/<projectId>/api#tokens` and update `studio/.env.local`.
- Required draft content writes have standing permission under AGENTS.md.
  Verify the target and backup before writing. Page drafting uses Sanity MCP
  for content mutations; the CLI supplies the verified recovery export.
  Dataset deletion, access changes, and unrelated cleanup require approval.
