FROM golang:1.22.5-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY go.sum ./
RUN go mod download
COPY *.go ./
RUN go build -o /cv-builder

FROM node:14 AS frontend-builder
WORKDIR /app
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /cv-builder ./
COPY --from=frontend-builder /app/build ./build
EXPOSE 8080
CMD ["./cv-builder"]