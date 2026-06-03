COMPOSE = docker compose -f compose.yaml
NETWORK = minuseek

.PHONY: network dev dev-build down logs

## Crée le réseau Docker partagé avec le back s'il n'existe pas (idempotent)
network:
	@docker network inspect $(NETWORK) >/dev/null 2>&1 || docker network create $(NETWORK)

## Lance le front en mode dev avec hot-reload (Vite)
dev: network
	$(COMPOSE) up

## Rebuild l'image puis lance le front en mode dev
dev-build: network
	$(COMPOSE) up --build

## Arrête le front
down:
	$(COMPOSE) down

## Affiche les logs du front en temps réel
logs:
	$(COMPOSE) logs -f
