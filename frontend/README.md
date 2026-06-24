# Invoice Processing Frontend

React UI with page-based folder structure.

## Page structure

Each route has its own folder under `src/pages/`:

```
pages/
├── home/          # route: /
│   ├── main.tsx   # page component
│   ├── api.ts     # axios API calls
│   ├── hooks.ts   # TanStack Query hooks
│   └── components/
└── auth/          # route: /auth
    ├── main.tsx
    ├── api.ts
    └── hooks.ts
```

TanStack Router files in `src/routes/` are thin wrappers that point to `pages/*/main.tsx`.

## Shared DataTable

Reusable TanStack Table wrapper at `src/components/common/data-table/`. Pages pass config arrays only — no `useReactTable` in routes or page `main.tsx`.

```tsx
<DataTable<Invoice>
  data={invoices}
  columns={columns}           // DataTableColumn[]
  rowActions={rowActions}     // per-row actions
  multiRowActions={bulkActions} // bulk actions when rows selected
  toolbarActions={toolbar}    // header toolbar buttons
  enableRowSelection
/>
```

Invoice-specific configs live in `pages/home/components/invoice-table.config.tsx`; `InvoiceTable` wires data + passes props.

## Docker

Built with Vite and served via `serve` on port 3000. The API runs separately on port 8000 — set `VITE_API_URL` at build time (configured in `docker-compose.yml`).

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` to `http://localhost:8000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
