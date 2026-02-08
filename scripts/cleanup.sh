#!/bin/bash
# ==============================================================================
# Cleanup Script
# Removes all deployed resources and stops services
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Cleanup Script                                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}This will:${NC}"
echo "  - Delete Kubernetes deployments and services"
echo "  - Stop Minikube (optional)"
echo "  - Stop Jenkins (optional)"
echo "  - Remove Docker images (optional)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Delete Kubernetes resources
echo -e "\n${GREEN}Step 1: Deleting Kubernetes resources...${NC}"
if minikube status &> /dev/null; then
    kubectl delete -f k8s/deployment.yaml 2>/dev/null || true
    kubectl delete -f k8s/dashboard.yaml 2>/dev/null || true
    kubectl delete -f k8s/namespace.yaml 2>/dev/null || true
    echo -e "${GREEN}✓ Kubernetes resources deleted${NC}"
else
    echo -e "${YELLOW}Minikube not running, skipping${NC}"
fi

# Stop Minikube
echo -e "\n${YELLOW}Stop Minikube? (y/n)${NC}"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Stopping Minikube...${NC}"
    minikube stop 2>/dev/null || true
    echo -e "${GREEN}✓ Minikube stopped${NC}"
fi

# Stop Jenkins
echo -e "\n${YELLOW}Stop Jenkins? (y/n)${NC}"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Stopping Jenkins...${NC}"
    brew services stop jenkins-lts 2>/dev/null || true
    echo -e "${GREEN}✓ Jenkins stopped${NC}"
fi

# Remove Docker images
echo -e "\n${YELLOW}Remove Docker images? (y/n)${NC}"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Removing Docker images...${NC}"
    docker rmi devops-taskboard:latest 2>/dev/null || true
    docker image prune -f
    echo -e "${GREEN}✓ Docker images cleaned${NC}"
fi

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Cleanup Complete!                                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
