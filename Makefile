.PHONY: help dev build test install stop

help:
	@echo "streaming-web-client targets:"
	@echo "  dev     - Start Vite dev server"
	@echo "  build   - Build for production"
	@echo "  test    - Run test suite"
	@echo "  install - Install dependencies"
	@echo "  stop    - Stop running instance"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

stop:
	pkill -f "vite" || true
	@echo "✓ Stopped streaming-web-client"
