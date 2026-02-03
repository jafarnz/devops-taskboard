#!/bin/bash
# ==============================================================================
# Blue Ocean Dashboard Setup Script for Jenkins
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Jenkins Blue Ocean Dashboard Setup                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Check if Jenkins is running
if ! curl -s -o /dev/null http://localhost:8080; then
    echo -e "${RED}Jenkins is not running. Please start Jenkins first:${NC}"
    echo "  brew services start jenkins-lts"
    exit 1
fi

echo -e "\n${GREEN}Jenkins is running at http://localhost:8080${NC}"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Blue Ocean Plugin Installation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "To install Blue Ocean, follow these steps:"
echo ""
echo "1. Open Jenkins: http://localhost:8080"
echo ""
echo "2. Navigate to: Manage Jenkins → Plugin Manager → Available plugins"
echo ""
echo "3. Search for and install these plugins:"
echo "   ✓ Blue Ocean"
echo "   ✓ Blue Ocean Pipeline Editor"
echo "   ✓ Blue Ocean Executor Info"
echo "   ✓ Pipeline: Stage View (for fallback visualization)"
echo ""
echo "4. Restart Jenkins after installation"
echo ""
echo "5. Access Blue Ocean at: http://localhost:8080/blue"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Required Plugins for Full Functionality${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Essential Plugins:"
echo "  • Blue Ocean                - Modern UI/UX"
echo "  • Docker Pipeline          - Docker integration"
echo "  • Pipeline                 - Jenkinsfile support"
echo "  • Pipeline: Stage View     - Stage visualization"
echo "  • Git                      - Git SCM support"
echo "  • Email Extension          - Email notifications"
echo "  • Timestamper              - Build timestamps"
echo "  • AnsiColor                - Colored output"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Creating Pipeline Job for Blue Ocean${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Option 1: Create Pipeline via Blue Ocean UI"
echo "  1. Open http://localhost:8080/blue"
echo "  2. Click 'New Pipeline'"
echo "  3. Select 'Git'"
echo "  4. Enter repository URL: https://github.com/jafarnz/devops-taskboard.git"
echo "  5. Blue Ocean will auto-detect the Jenkinsfile"
echo ""
echo "Option 2: Create Pipeline via Classic UI"
echo "  1. Open http://localhost:8080"
echo "  2. Click 'New Item'"
echo "  3. Name: devops-taskboard"
echo "  4. Select 'Pipeline'"
echo "  5. Under Pipeline section:"
echo "     - Definition: Pipeline script from SCM"
echo "     - SCM: Git"
echo "     - Repository URL: https://github.com/jafarnz/devops-taskboard.git"
echo "     - Branch: */main"
echo "     - Script Path: Jenkinsfile"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Blue Ocean Features${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Blue Ocean provides:"
echo "  📊 Visual pipeline editor"
echo "  🎯 Real-time build progress"
echo "  📈 Historical build trends"
echo "  🔍 Detailed stage logs"
echo "  🌿 Branch and PR visualization"
echo "  ⚡ Quick navigation between builds"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Blue Ocean Setup Instructions Complete!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Quick Links:${NC}"
echo "  Classic Jenkins:  http://localhost:8080"
echo "  Blue Ocean:       http://localhost:8080/blue"
echo "  Plugin Manager:   http://localhost:8080/pluginManager/"
echo ""
