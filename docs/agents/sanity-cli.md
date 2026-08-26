# Sanity CLI

The Sanity CLI does not automatically read `studio/.env.local`. Always prefix CLI commands with the auth token:

```bash
cd studio && SANITY_AUTH_TOKEN=$(grep SANITY_AUTH_TOKEN .env.local | cut -d= -f2) npx sanity <command>
```

This applies to all CLI operations: `dataset import`, `dataset export`, `deploy`, `schema extract`, etc.

## Notes

- Tokens are project-scoped. If the project ID changes, generate a new token at `https://www.sanity.io/manage/project/<projectId>/api#tokens` and update `studio/.env.local`.
- Dataset mutations (import, delete, etc.) always require explicit user approval.
