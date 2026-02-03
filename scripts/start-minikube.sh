#!/bin/bash
# ==============================================================================
# Start and Configure Minikube Script
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Starting Minikube Cluster                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Check current Minikube status
if minikube status &> /dev/null; then
    echo -e "${GREEN}Minikube is already running${NC}"
    minikube status
else
    echo -e "${YELLOW}Starting Minikube...${NC}"
    minikube start --driver=docker --cpus=2 --memory=4096
fi

echo -e "\n${GREEN}Step 1: Enabling addons...${NC}"
minikube addons enable dashboard
minikube addons enable metrics-server
minikube addons enable ingress

echo -e "\n${GREEN}Step 2: Setting up Docker environment...${NC}"
echo -e "${YELLOW}Run this command to use Minikube's Docker daemon:${NC}"
echo "eval \$(minikube docker-env)"

echo -e "\n${GREEN}Step 3: Cluster Information${NC}"
kubectl cluster-info
kubectl get nodes

echo -e "\n${GREEN}Step 4: Building application image in Minikube...${NC}"
# Use Minikube's Docker daemon
eval $(minikube docker-env)

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t devops-taskboard:latest .

echo -e "\n${GREEN}Step 5: Deploying application...${NC}"
kubectl apply -f k8s/namespace.yaml 2>/dev/null || true
kubectl apply -f k8s/deployment.yaml

echo -e "\n${YELLOW}Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/devops-taskboard --timeout=120s

echo -e "\n${GREEN}Step 6: Checking deployment status...${NC}"
kubectl get pods -l app=devops-taskboard
kubectl get services

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Minikube Setup Complete!                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}Access the application:${NC}"
echo "  minikube service devops-taskboard-service"
echo ""
echo -e "${YELLOW}Open Kubernetes Dashboard:${NC}"
echo "  minikube dashboard"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo "  kubectl logs -l app=devops-taskboard -f"
