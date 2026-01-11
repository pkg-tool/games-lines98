.PHONY: all install test build clean

# Default target
all: install test build

# Install dependencies (clean install)
install:
	npm ci

# Run tests
test:
	npm run test -- run

# Build for production
build:
	npm run build

# Clean dist folder
clean:
	rm -rf dist
