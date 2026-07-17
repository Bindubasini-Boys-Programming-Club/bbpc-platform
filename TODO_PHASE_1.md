# Phase 1 TODO (BBPC Premium Ecosystem)

## Branding cleanup
- [ ] Replace all visible “bearnie”/repo wordmark occurrences in public header/nav with “BBPC”.
- [ ] Ensure Footer matches required text (Built by Nuren Zarif Haque) and no Bearnie branding leaks.

## Unified navigation (balanced header)
- [ ] Update `src/components/global/navigation/Navigation.astro`:
  - [ ] Center primary nav: Home, About, Projects, Skills, AI Assistant, Community, Contact
  - [ ] Right side: Notifications, Settings, Profile/Sign In
  - [ ] Theme toggle always last at far right.

## Authentication + auth state management
- [ ] Fix navbar auth state switching to use the real dropdown component (no innerHTML replacement).
- [ ] Ensure login/logout updates navbar immediately via `bbpc:auth-changed` event.
- [ ] Make Sign In/Avatar dropdown entries align with spec (Profile, Dashboard, Notifications, My Posts, Settings, Logout).

## Member area + profile architecture
- [ ] Create reusable premium layout components for member area (no duplicated layouts).
- [ ] Add routes (stubs but premium empty states):
  - [ ] `/dashboard`
  - [ ] `/announcements`
  - [ ] `/blog`
  - [ ] `/events`
  - [ ] `/projects`
  - [ ] `/gallery`
  - [ ] `/resources`
  - [ ] `/members`
  - [ ] `/profile`
  - [ ] `/settings`
  - [ ] `/admin`
- [ ] Implement production-ready profile view structure (avatar, cover, display name, username, bio, role, social links, skills, picture upload placeholders, joined date, recent activity, achievements).

## Protected routes
- [ ] Implement protected route guard (non-breaking, modular, easy to extend).
- [ ] If logged out: open Sign In modal or route to login-friendly UX without page reload.

## Settings modal (complete UI)
- [ ] Build settings modal using existing dialog system with:
  - [ ] Tabs: Appearance, Notifications, Account, Privacy, Accessibility, Language, Security, About BBPC
  - [ ] ESC + outside click to close
  - [ ] Focus trap
  - [ ] Large close button

## Prepare for Phase 2 (reusable components)
- [ ] Add/prepare reusable UI blocks/components (empty-state cards, member cards, dashboard shell, notifications shell, blog shells, events shells, resources/project/gallery shells).

## Verification checklist
- [ ] `npm run dev` builds/runs.
- [ ] No runtime errors.
- [ ] No hydration issues.
- [ ] All routes resolve.
- [ ] TypeScript passes.
- [ ] Dark/light mode works.
- [ ] Responsive behavior unchanged.

