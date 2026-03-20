
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

  Authenticated pages under [`src/app/router/feed.routes.tsx`](src/app/router/feed.routes.tsx) and [`src/app/router/marketplace.routes.tsx`](src/app/router/marketplace.routes.tsx) use [`AppShellWithFooterLayout`](src/app/layouts/AppShellLayout.tsx) or [`AppShellHeaderOnlyLayout`](src/app/layouts/AppShellLayout.tsx) as parent routes. The shell owns `min-h-screen`, background, and optional global `Footer`.

  - **With footer:** register the route inside `AppShellWithFooterLayout` (e.g. saved items, AI creative lab). Sticky footer is handled by the shell.
  - **Header only:** use `AppShellHeaderOnlyLayout` for feeds, marketplace, or infinite-scroll pages (no site footer).
  - **Page root:** the routed page should use a root wrapper `className="flex min-h-0 flex-1 flex-col"` and put primary content in `<main className="flex-1 ...">` (or equivalent) so the flex column fills the shell between header and footer.

  Add new routes by nesting the correct layout alongside siblings in the same route file; avoid duplicating `min-h-screen` on the page when the shell already provides it.
