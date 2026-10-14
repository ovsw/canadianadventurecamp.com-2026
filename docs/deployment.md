# Deployment

The Website and Studio are separate applications.

## Website on Vercel

1. Import the GitHub repository into Vercel.
2. Set the project root directory to `frontend`.
3. Add the variables from `frontend/.env.local.example`. Set
   `NEXT_PUBLIC_SITE_ENV=production` in Vercel's Production environment so the
   deployed site is indexable. Keep `development` locally and for Preview
   deployments so unfinished revisions remain `noindex`.
4. Use `main` as the production branch.
5. A ruleset on `main` requires the GitHub `Release gate` check before a pull
   request can merge. Repository admins may bypass it; do not.

Vercel may create preview deployments for pull requests. Production deploys come only from verified revisions merged into `main`.

## Studio on Sanity

Add the local values from `studio/.env.local.example`. Confirm that the
deployed Website origin in `studio/.env.production` is correct. Then deploy
manually from the repository root:

```bash
pnpm setup:sanity-cors
pnpm deploy:studio
```

`pnpm deploy:studio` and `pnpm --dir studio deploy` use the same guard. They
take the preview origin and Studio app ID from `studio/.env.production`,
even when the terminal has local values set. The auth token comes from
`studio/.env.local`. A missing setting, local address, or non-HTTPS preview
stops the command before build or upload. The command always builds a fresh
Studio; it does not accept arguments that could skip the build.

Do not deploy with `sanity deploy` directly or preload `.env.local` into the
terminal. Direct CLI deployment bypasses the guard.

Studio deployment remains manual. Vercel deployment uses the existing project configuration and credentials.

## Content goes live on publish

The Website keeps the Sanity content of each page in its cache, and each
cached read carries Sanity's sync tags: labels for the content it used.
`<SanityLive />` expires them only while a visitor has a page open, so the
Sanity Function `invalidate-tags` (`studio/functions/invalidate-tags`) does it
on every publish, with no visitor needed. This is next-sanity's "guaranteed
live content updates" setup:

1. After a publish, Sanity calls the function with the sync tags of the
   changed content.
2. The function sends them to `/api/revalidate-tags`, which expires each one.
   Every page that shows the change (for example, the footer on every page)
   is fresh on its next visit, and no other page is.
3. The function calls `done()`. Only then does Sanity tell open pages about
   the change (`<SanityLive waitFor="function" />` in production), so they
   never reload the old version. Preview deployments and local development
   keep the default behaviour, because the function expires only the
   production Website's cache.

| Setting | Value |
| --- | --- |
| Blueprint | `studio/sanity.blueprint.ts`, stack `production` in project `bf76qlx9` |
| Function | `invalidate-tags`, for the `production` dataset |
| Function variable `REVALIDATE_TAGS_URL` | `https://cacweb-2026.vercel.app/api/revalidate-tags`; change it to the custom domain at launch |
| Function variable `SANITY_REVALIDATE_SECRET` | The same value as the Website's |
| Website variable `SANITY_REVALIDATE_SECRET` | In Vercel, Production, sensitive |

The secret is kept only in Vercel, in the function's variables, and in the
local `frontend/.env.local`. The route refuses a call without it.

Set or change a function variable, deploy a changed function, and check its
log after a publish, from the repository root:

```bash
pnpm --dir studio exec sanity functions env add invalidate-tags <KEY> <VALUE>
pnpm --dir studio exec sanity blueprints plan
pnpm --dir studio exec sanity blueprints deploy
pnpm --dir studio exec sanity functions logs invalidate-tags
```

A good run logs "The Website expired N sync tags" and "Released the change to
open pages: HTTP 2xx". Test the function without a publish with
`pnpm --dir studio exec sanity functions test invalidate-tags --data '{"syncTags":["test"]}' --timeout 20`.

A new checkout links to the stack with
`pnpm --dir studio exec sanity blueprints config --edit --project-id bf76qlx9 --stack production`
(the link is in the ignored `studio/.sanity/`). Function runs are part of the
Sanity plan's included usage; each publish uses one.

## Before the first production deploy

- Run `pnpm verify`.
- Run `pnpm setup:sanity-cors` to add the Website and Studio origins to the
  Sanity project's CORS settings.
- Confirm the Vercel root directory is `frontend`.
- Confirm the GitHub `Release gate` check is required on `main`.
- Confirm the Studio hostname is correct.
