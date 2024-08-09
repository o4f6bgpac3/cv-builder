# Build stage
FROM golang:1.22.5-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Download dependencies first (leverages Docker cache)
COPY go.mod go.sum ./
RUN go mod download

# Copy and build the application
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -ldflags="-w -s" -o /cv-builder

# Frontend build stage
FROM node:18 AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --only=production
COPY frontend/ ./
RUN npm run build

# Final stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /cv-builder ./
COPY --from=frontend-builder /app/build ./build
EXPOSE 8080
CMD ["./cv-builder"]