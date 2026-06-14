COMPOSE = docker compose -f compose.yaml
NETWORK = minuseek

## Fix pour Windows
ifeq ($(OS),Windows_NT)
  NULL_DEV = NUL
else
  NULL_DEV = /dev/null
endif

.PHONY: network dev down logs lint build-pnpm

## Crée le réseau Docker partagé avec le back s'il n'existe pas (idempotent)
network:
	@docker network inspect $(NETWORK) >$(NULL_DEV) 2>&1 || docker network create $(NETWORK)

## Lance le front en mode dev avec hot-reload (Vite)
dev: network
	$(COMPOSE) up --build -V


## Arrête le front
down:
	$(COMPOSE) down

## Affiche les logs du front en temps réel
logs:
	$(COMPOSE) logs -f
	
## Lance le linter (ESLint) dans le conteneur
lint:
	$(COMPOSE) run --rm dev pnpm lint

## Build de production (tsc + vite build) dans le conteneur
build-pnpm:
	$(COMPOSE) run --rm dev pnpm build
