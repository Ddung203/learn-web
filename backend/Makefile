.PHONY: run build test clean

# Run the server
run:
	go run main.go

# Build the binary
build:
	go build -o bin/server main.go

# Run tests
test:
	go test -v ./...

# Clean build artifacts
clean:
	rm -rf bin/

# Install dependencies
deps:
	go mod download
	go mod tidy

# Format code
fmt:
	go fmt ./...

# Lint code (requires golangci-lint)
lint:
	golangci-lint run

# Run with hot reload (requires air)
dev:
	air
