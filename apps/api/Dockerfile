FROM node:22-alpine AS base
RUN npm install -g pnpm@9.15.9
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
# ── Dependencies ─────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/validators/package.json packages/validators/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
# pnpm needs all workspace package.jsons to resolve workspace:*
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install
# ── Development (hot-reload via tsx watch) ───────────────────────────
FROM deps AS dev
EXPOSE 4000
CMD ["pnpm", "--filter", "api", "dev"]
# ── Build ────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm --filter api build
# ── Production ───────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]