FROM node:24-alpine AS frontend
WORKDIR /build/frontend
RUN corepack enable
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm run build

FROM golang:1.27-alpine AS backend
WORKDIR /build/backend
COPY backend/go.mod backend/go.sum ./
COPY backend/ ./
RUN CGO_ENABLED=0 go test ./... && CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /optimus-admin ./cmd/server

FROM scratch
WORKDIR /app
COPY --from=backend /optimus-admin /app/optimus-admin
COPY --from=frontend /build/frontend/dist/optimus-admin/browser /app/public
ENV OPTIMUS_ADMIN_ADDRESS=:8080
ENV OPTIMUS_ADMIN_WEB_ROOT=/app/public
EXPOSE 8080
USER 65532:65532
ENTRYPOINT ["/app/optimus-admin"]
