#!/bin/bash
# ==============================================================================
# Podman Build and Run Script for DevOps Taskboard
# Alternative to Docker for containerization
# ==============================================================================

set -e

# Configuration
IMAGE_NAME="devops-taskboard"
IMAGE_TAG="${1:-latest}"
CONTAINER_NAME="taskboard"
PORT="${PORT:-3000}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Podman Build & Run Script${NC}"
echo -e "${GREEN}Alternative Containerization Tool${NC}"
echo -e "${GREEN}============================================${NC}"

# Check if Podman is installed
if ! command -v podman &> /dev/null; then
    echo -e "${RED}Error: Podman is not installed${NC}"
    echo "Install Podman using:"
    echo "  macOS: brew install podman"
    echo "  Ubuntu/Debian: sudo apt install podman"
    echo "  Fedora: sudo dnf install podman"
    exit 1
fi

echo -e "${YELLOW}Podman version:${NC}"
podman --version

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo -e "\n${YELLOW}Step 1: Building Podman image...${NC}"
podman build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

echo -e "\n${YELLOW}Step 2: Verifying image...${NC}"
podman images | grep "${IMAGE_NAME}"

# Stop and remove existing container if it exists
echo -e "\n${YELLOW}Step 3: Cleaning up existing container...${NC}"
podman stop "${CONTAINER_NAME}" 2>/dev/null || true
podman rm "${CONTAINER_NAME}" 2>/dev/null || true

echo -e "\n${YELLOW}Step 4: Running container...${NC}"
podman run -d \
    --name "${CONTAINER_NAME}" \
    -p "${PORT}:3000" \
    -e NODE_ENV=production \
    "${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "\n${YELLOW}Step 5: Checking container status...${NC}"
sleep 3
podman ps | grep "${CONTAINER_NAME}"

echo -e "\n${YELLOW}Step 6: Testing application...${NC}"
sleep 5
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/tasks" | grep -q "200"; then
    echo -e "${GREEN}✓ Application is running and responding${NC}"
else
    echo -e "${YELLOW}! Application may still be starting up${NC}"
fi

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}Container is running!${NC}"
echo -e "${GREEN}Access the application at: http://localhost:${PORT}${NC}"
echo -e "${GREEN}============================================${NC}"

echo -e "\n${YELLOW}Useful commands:${NC}"
echo "  View logs: podman logs ${CONTAINER_NAME}"
echo "  Stop: podman stop ${CONTAINER_NAME}"
echo "  Remove: podman rm ${CONTAINER_NAME}"
echo "  Shell access: podman exec -it ${CONTAINER_NAME} /bin/sh"

# Generate Kubernetes manifest from running container
echo -e "\n${YELLOW}Generating Kubernetes manifest from container...${NC}"
podman generate kube "${CONTAINER_NAME}" > "${PROJECT_ROOT}/podman/generated-k8s.yaml" 2>/dev/null || true
echo "Generated: podman/generated-k8s.yaml"
