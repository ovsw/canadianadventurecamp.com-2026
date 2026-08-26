# Fresh-clone proof

Use a disposable Sanity project and dataset. Never run this checklist against production.

1. Clone the repository into a new directory and use the Node and pnpm versions declared by the repository.
2. Run `pnpm install --frozen-lockfile`.
3. Copy the Website and Studio example environment files, then set both workspaces to the disposable Sanity target.
4. Run `pnpm setup`, followed by `pnpm seed`; confirm the sample Website and Studio content loads.
5. Run `pnpm verify` to check generated types, type checks, lint, tests, production builds, and the smoke journey.
6. Run `pnpm unseed` and confirm it removes only the marked Starter content and asset.

Record the tested commit, Node and pnpm versions, and disposable target before publishing the Starter revision.
