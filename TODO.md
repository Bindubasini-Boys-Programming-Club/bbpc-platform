# TODO

## SQLite/Vercel build fix
- [ ] Remove `sqlite3` from dependencies (native binding causing GLIBC_2.38 error)
- [ ] Delete/disable sqlite DB runtime usage to avoid pulling native deps at build time
- [ ] Ensure auth still works using existing in-memory mock repo
- [ ] Update any import wiring so Vercel build no longer touches sqlite3
- [ ] Verify `npm install` + `npm run build` succeed

## Delivery
- [ ] Provide exact list of changed files with complete code for each.

