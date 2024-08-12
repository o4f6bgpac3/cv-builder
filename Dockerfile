# Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
RUN npm install -g pnpm
COPY frontend/package*.json ./
RUN pnpm install --no-frozen-lockfile
COPY frontend/ ./
RUN pnpm build

# Build backend
FROM golang:1.22.5-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -ldflags="-w -s" -o /cv-builder

# Final stage
FROM alpine:3.18
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=backend-builder /cv-builder ./
COPY --from=frontend-builder /app/build ./build
EXPOSE 8080
CMD ["./cv-builder"]