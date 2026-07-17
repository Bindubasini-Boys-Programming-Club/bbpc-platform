# BBPC Conversion TODO

## Completed
- Updated `src/layouts/DocsLayout.astro` to generate navigation without the `components` collection.
- Rebranded header navigation links in `src/components/global/navigation/Navigation.astro` (Docs wording removed).
- Converted `src/content/docs/{introduction,cli,installation,mcp}.mdx` into club content.
- Added `src/components/auth/SignInDialog.astro` and wired “Sign In” into the top navigation via modal.
- Build produces `dist/` successfully.

## Remaining (must complete)
1. Create standalone pages using existing DocsLayout shell:
   - `/about`, `/events`, `/members`, `/gallery`, `/projects`, `/contact`, `/login`.
2. Implement club sidebar navigation items in `DocsLayout.astro`:
   - Dashboard, Announcements, Members, Projects, Events, Resources, Gallery, Settings, Admin Panel, Contact.
3. Replace remaining docs-only content and routing:
   - Remove/disable docs search, docs component showcase, code buttons/code blocks, and docs-only components.
4. Delete unused docs content files/routes that remain after step (1)-(3).
5. Rebrand all visible “Bearnie” to “BBPC” (siteConfig + logos + metadata + any footer text).
6. Validate accessibility + responsive behavior + animations via `npm run build` and `npm run dev`.

