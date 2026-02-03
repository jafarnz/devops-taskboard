#!/bin/bash
# ==============================================================================
# Build and Deploy Script
# Quick deployment script for local development
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
IMAGE_NAME="devops-taskboard"
IMAGE_TAG="${1:-latest}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Build and Deploy DevOps Taskboard                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Check prerequisites
echo -e "\n${GREEN}Checking prerequisites...${NC}"

if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

if ! minikube status &> /dev/null; then
    echo -e "${YELLOW}Starting Minikube...${NC}"
    minikube start --driver=docker
fi

# Use Minikube's Docker daemon
echo -e "\n${GREEN}Step 1: Configuring Docker environment...${NC}"
eval $(minikube docker-env)

# Build image
echo -e "\n${GREEN}Step 2: Building Docker image...${NC}"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

# Apply Kubernetes manifests
echo -e "\n${GREEN}Step 3: Deploying to Kubernetes...${NC}"
kubectl apply -f k8s/namespace.yaml 2>/dev/null || true
kubectl apply -f k8s/deployment.yaml

# Wait for rollout
echo -e "\n${GREEN}Step 4: Waiting for deployment...${NC}"
kubectl rollout status deployment/devops-taskboard --timeout=120s

# Show status
echo -e "\n${GREEN}Step 5: Deployment Status${NC}"
echo -e "${YELLOW}Pods:${NC}"
kubectl get pods -l app=devops-taskboard

echo -e "\n${YELLOW}Services:${NC}"
kubectl get services

# Get service URL
echo -e "\n${GREEN}Step 6: Getting application URL...${NC}"
SERVICE_URL=$(minikube service devops-taskboard-service --url 2>/dev/null || echo "")

if [ -n "$SERVICE_URL" ]; then
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     Deployment Successful!                                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Application URL: ${NC}${SERVICE_URL}"
    echo ""
    echo -e "${YELLOW}Test the API:${NC}"
    echo "  curl ${SERVICE_URL}/tasks"
    echo ""
    echo -e "${YELLOW}Open Dashboard:${NC}"
    echo "  minikube dashboard"
else
    echo -e "\n${YELLOW}To access the application, run:${NC}"
    echo "  minikube service devops-taskboard-service"
fi
