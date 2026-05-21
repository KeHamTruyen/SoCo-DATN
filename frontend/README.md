
  # Social Commerce Platform

  This is a code bundle for Social Commerce Platform. The original project is available at https://www.figma.com/design/yNg3c2y8TI5XZkyOQtNj8v/Social-Commerce-Platform.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Theming (Tailwind + CSS variables)

  Global styles live in [`src/styles/globals.css`](src/styles/globals.css) (imported from [`src/index.css`](src/index.css)). The active theme is driven by the `dark` class on `<html>` (see `ThemePreferenceProvider`).

  **Prefer semantic utilities** so components work in light, dark, and system mode without paired `dark:` classes:

  | Use | Instead of |
  |-----|------------|
  | `bg-background`, `text-foreground` | `bg-background-light dark:bg-background-dark` (legacy; still available) |
  | `bg-card`, `text-card-foreground`, `border-border` | `bg-white dark:bg-neutral-900` + duplicated borders |
  | `text-muted-foreground` | `text-neutral-600 dark:text-neutral-400` (when meaning “secondary text”) |
  | `bg-muted` | `bg-neutral-50 dark:bg-neutral-800` (when meaning “subtle surface”) |

  For full-page layouts, you can use the `PageShell` component (`min-h-screen bg-background text-foreground`). Reserve raw `neutral-*` shades for one-off accents when no semantic token fits.

  ## App shell layouts (header / footer)

  App pages use [`AppShellHeaderLayout`](src/app/layouts/AppShellLayout.tsx) or [`AppShellHeaderFooterLayout`](src/app/layouts/AppShellLayout.tsx) as parent routes. The shell owns `min-h-screen`, background, [`UnifiedHeader`](src/shared/ui/organisms/unified-header/UnifiedHeader.tsx), and optional global `Footer`.

  - **With footer:** register inside `AppShellHeaderFooterLayout` (e.g. product detail, saved items, AI creative lab).
  - **Header only:** use `AppShellHeaderLayout` for feed, marketplace, social, commerce, etc.
  - **No chrome:** auth flows use `AuthLayout`; checkout success and seller onboarding use `BareLayout`.
  - **Route `handle`:** set `handle={{ header: { activePath: "/feed" } }}` on routes (see [`routeHandle.ts`](src/app/router/routeHandle.ts)).
  - **Dynamic header (search):** pages call `useConfigureAppHeader` from [`AppHeaderContext`](src/app/layouts/AppHeaderContext.tsx).
  - **Page root:** render `<main className="flex-1 ...">` only; do not import `UnifiedHeader` on pages under a shell layout.
