#!/bin/bash
# ==============================================================================
# Dashboard Setup Script
# Configures visual monitoring tools for the CI/CD pipeline
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Visual Dashboard Setup Script${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo -e "${YELLOW}Minikube is not running. Starting...${NC}"
    minikube start --driver=docker
fi

echo -e "\n${GREEN}Step 1: Enabling Kubernetes Dashboard...${NC}"
minikube addons enable dashboard

echo -e "\n${GREEN}Step 2: Enabling Metrics Server...${NC}"
minikube addons enable metrics-server

echo -e "\n${GREEN}Step 3: Enabling Ingress Controller...${NC}"
minikube addons enable ingress

echo -e "\n${GREEN}Step 4: Listing enabled addons...${NC}"
minikube addons list | grep enabled

echo -e "\n${GREEN}Step 5: Creating Dashboard Admin User...${NC}"
# Create admin service account for dashboard
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF

echo -e "\n${GREEN}Step 6: Generating Dashboard Access Token...${NC}"
echo -e "${YELLOW}Use this token to login to the dashboard:${NC}"
kubectl -n kubernetes-dashboard create token admin-user 2>/dev/null || \
    kubectl -n kubernetes-dashboard get secret $(kubectl -n kubernetes-dashboard get sa/admin-user -o jsonpath="{.secrets[0].name}") -o go-template="{{.data.token | base64decode}}" 2>/dev/null || \
    echo "Token generation may require manual steps"

echo -e "\n${BLUE}============================================${NC}"
echo -e "${BLUE}Dashboard Setup Complete!${NC}"
echo -e "${BLUE}============================================${NC}"

echo -e "\n${YELLOW}To access the dashboard, run:${NC}"
echo "  minikube dashboard"
echo ""
echo -e "${YELLOW}Or access directly via proxy:${NC}"
echo "  kubectl proxy"
echo "  Open: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"

echo -e "\n${YELLOW}To view application status:${NC}"
echo "  kubectl get pods -l app=devops-taskboard"
echo "  kubectl get services"
echo "  kubectl top pods  # Requires metrics-server"
