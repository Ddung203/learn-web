FROM golang:1.25.4-alpine3.21 AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build binary
RUN CGO_ENABLED=0 go build -o main .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .

COPY config ./config

EXPOSE 8080

CMD ["./main"]
