#!/bin/bash
# ==============================================================================
# Start and Configure Jenkins Script
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Starting Jenkins Server                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Check if Jenkins is installed
if ! brew list jenkins-lts &> /dev/null; then
    echo -e "${RED}Jenkins is not installed. Run ./scripts/install-tools.sh first${NC}"
    exit 1
fi

# Start Jenkins service
echo -e "\n${GREEN}Starting Jenkins service...${NC}"
brew services start jenkins-lts

# Wait for Jenkins to start
echo -e "${YELLOW}Waiting for Jenkins to start...${NC}"
sleep 10

# Check if Jenkins is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "403\|200"; then
    echo -e "${GREEN}✓ Jenkins is running at http://localhost:8080${NC}"
else
    echo -e "${YELLOW}Jenkins may still be starting up...${NC}"
fi

# Get initial admin password
JENKINS_HOME="${HOME}/.jenkins"
INITIAL_PASSWORD_FILE="${JENKINS_HOME}/secrets/initialAdminPassword"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Jenkins Initial Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "$INITIAL_PASSWORD_FILE" ]; then
    echo -e "\n${YELLOW}Initial Admin Password:${NC}"
    cat "$INITIAL_PASSWORD_FILE"
    echo ""
else
    echo -e "${YELLOW}Initial admin password file not found.${NC}"
    echo -e "${YELLOW}Jenkins may already be configured.${NC}"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Required Jenkins Plugins${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Install these plugins in Jenkins → Manage Jenkins → Plugin Manager:"
echo ""
echo "  1. Docker Pipeline"
echo "  2. Kubernetes"
echo "  3. Blue Ocean (for visual pipeline)"
echo "  4. Email Extension Plugin"
echo "  5. Pipeline"
echo "  6. Git"
echo "  7. NodeJS (optional)"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Configure Email Notifications${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Go to: Manage Jenkins → System"
echo "2. Configure Extended E-mail Notification:"
echo "   - SMTP server: smtp.gmail.com (for Gmail)"
echo "   - SMTP Port: 465 (SSL) or 587 (TLS)"
echo "   - Use SSL: checked"
echo "   - Credentials: Add your email credentials"
echo "3. Configure E-mail Notification (legacy):"
echo "   - Same SMTP settings as above"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Create Pipeline Job${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. New Item → Pipeline"
echo "2. Name: devops-taskboard"
echo "3. Pipeline section:"
echo "   - Definition: Pipeline script from SCM"
echo "   - SCM: Git"
echo "   - Repository URL: https://github.com/jafarnz/devops-taskboard.git"
echo "   - Branch: */main"
echo "   - Script Path: Jenkinsfile"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Jenkins is Ready!                                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Access Jenkins at: ${NC}http://localhost:8080"
echo -e "${YELLOW}Blue Ocean Dashboard: ${NC}http://localhost:8080/blue"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  Stop Jenkins:    brew services stop jenkins-lts"
echo "  Restart Jenkins: brew services restart jenkins-lts"
echo "  View logs:       tail -f ${JENKINS_HOME}/jenkins.log"
