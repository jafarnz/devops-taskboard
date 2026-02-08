#!/bin/bash
# ==============================================================================
# Complete CI/CD Environment Setup Script for macOS
# Installs: Docker, Minikube, kubectl, Jenkins
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Complete CI/CD Environment Setup for macOS             ║${NC}"
echo -e "${BLUE}║     DevOps Taskboard Project                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

echo -e "\n${GREEN}Updating Homebrew...${NC}"
brew update

# ==============================================================================
# 1. Install Docker Desktop
# ==============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Docker Desktop${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is already installed${NC}"
    docker --version
else
    echo -e "${YELLOW}Installing Docker Desktop...${NC}"
    brew install --cask docker
    echo -e "${YELLOW}Please start Docker Desktop from Applications${NC}"
    echo -e "${YELLOW}Press Enter when Docker Desktop is running...${NC}"
    read -r
fi

# ==============================================================================
# 2. Install Minikube
# ==============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Minikube${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v minikube &> /dev/null; then
    echo -e "${GREEN}✓ Minikube is already installed${NC}"
    minikube version
else
    echo -e "${YELLOW}Installing Minikube...${NC}"
    brew install minikube
fi

# ==============================================================================
# 3. Install kubectl
# ==============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: kubectl${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v kubectl &> /dev/null; then
    echo -e "${GREEN}✓ kubectl is already installed${NC}"
    kubectl version --client
else
    echo -e "${YELLOW}Installing kubectl...${NC}"
    brew install kubectl
fi

# ==============================================================================
# 4. Install Jenkins
# ==============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4: Jenkins${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if brew list jenkins-lts &> /dev/null; then
    echo -e "${GREEN}✓ Jenkins is already installed${NC}"
else
    echo -e "${YELLOW}Installing Jenkins LTS...${NC}"
    brew install jenkins-lts
fi

# ==============================================================================
# 5. Install Additional Tools
# ==============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 6: Additional Tools${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Install Node.js if not present
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js is already installed${NC}"
    node --version
else
    echo -e "${YELLOW}Installing Node.js...${NC}"
    brew install node@20
fi

# Install jq for JSON processing
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✓ jq is already installed${NC}"
else
    echo -e "${YELLOW}Installing jq...${NC}"
    brew install jq
fi

# ==============================================================================
# Summary
# ==============================================================================
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Installation Complete!                                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}Installed Components:${NC}"
echo "  - Docker:    $(docker --version 2>/dev/null || echo 'Not running')"
echo "  - Minikube:  $(minikube version --short 2>/dev/null || echo 'N/A')"
echo "  - kubectl:   $(kubectl version --client --short 2>/dev/null || echo 'N/A')"
echo "  - Jenkins:   $(brew info jenkins-lts 2>/dev/null | head -1 || echo 'Installed')"
echo "  - Node.js:   $(node --version 2>/dev/null || echo 'N/A')"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "  1. Start Docker Desktop (if not running)"
echo "  2. Run: ./scripts/start-minikube.sh"
echo "  3. Run: ./scripts/start-jenkins.sh"
echo "  4. Configure Jenkins with the Jenkinsfile"
echo ""
echo -e "${BLUE}See README.md for detailed instructions${NC}"
