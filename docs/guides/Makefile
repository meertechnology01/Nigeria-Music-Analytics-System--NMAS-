.PHONY: help install dev build test clean migrate migrate-create db-upgrade db-downgrade frontend-dev frontend-build backend-dev backend-test

help:
	@echo "Nigeria Music Analytics System (NMAS) - Available Commands"
	@echo "=============================================="
	@echo "Setup:"
	@echo "  make install          - Install all dependencies (backend + frontend)"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start both backend and frontend in dev mode"
	@echo "  make backend-dev      - Start backend only with hot reload"
	@echo "  make frontend-dev     - Start frontend only with hot reload"
	@echo ""
	@echo "Database:"
	@echo "  make migrate          - Run database migrations"
	@echo "  make migrate-create   - Create a new migration (set MSG='description')"
	@echo "  make db-upgrade       - Upgrade database to latest version"
	@echo "  make db-downgrade     - Downgrade database by one version"
	@echo ""
	@echo "Build:"
	@echo "  make build            - Build production artifacts"
	@echo "  make frontend-build   - Build frontend only"
	@echo ""
	@echo "Testing:"
	@echo "  make test             - Run all tests"
	@echo "  make backend-test     - Run backend tests only"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            - Remove build artifacts and caches"

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installation complete!"

dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:8000"
	@echo "Frontend will run on http://localhost:5173"
	@cd backend && python dev.py & cd frontend && npm run dev

backend-dev:
	cd backend && python dev.py

frontend-dev:
	cd frontend && npm run dev

build: frontend-build
	@echo "Build complete!"

frontend-build:
	cd frontend && npm run build

test: backend-test
	@echo "All tests complete!"

backend-test:
	cd backend && pytest

migrate: db-upgrade

migrate-create:
ifndef MSG
	@echo "Error: MSG not set. Usage: make migrate-create MSG='your migration message'"
	@exit 1
endif
	cd backend && alembic revision --autogenerate -m "$(MSG)"

db-upgrade:
	cd backend && alembic upgrade head

db-downgrade:
	cd backend && alembic downgrade -1

clean:
	@echo "Cleaning build artifacts..."
	rm -rf frontend/dist
	rm -rf backend/__pycache__
	rm -rf backend/**/__pycache__
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	@echo "Clean complete!"

.DEFAULT_GOAL := help
