# DevOps Taskboard - CI/CD Pipeline Documentation

[![GitHub Actions](https://github.com/jafarnz/devops-taskboard/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/jafarnz/devops-taskboard/actions/workflows/ci-cd.yml)

GitHub Actions dashboard: https://github.com/jafarnz/devops-taskboard/actions/workflows/ci-cd.yml

## Project Overview

This project implements a complete CI/CD pipeline using Jenkins, Docker, and Minikube, with additional features including:

1. ✅ **Visual Tools/Dashboard** - Kubernetes Dashboard & Jenkins Blue Ocean
2. ✅ **Jenkins Email Notification** - Automated email alerts for build status
3. ✅ **GitHub Actions** - Alternative CI/CD tool implementation

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup Guide](#detailed-setup-guide)
4. [Pipeline Overview](#pipeline-overview)
5. [Additional Features](#additional-features)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- macOS (this guide is written for macOS)
- Homebrew package manager
- Git
- At least 8GB RAM recommended
- 20GB free disk space

---

## Quick Start

### Step 1: Install All Tools

```bash
chmod +x scripts/*.sh
./scripts/install-tools.sh
```

### Step 2: Start Minikube and Deploy

```bash
./scripts/start-minikube.sh
```

### Step 3: Start Jenkins

```bash
./scripts/start-jenkins.sh
```

### Step 4: Access Applications

- **Application**: Run `minikube service devops-taskboard-service`
- **Kubernetes Dashboard**: Run `minikube dashboard`
- **Jenkins**: Open http://localhost:8080
- **Jenkins Blue Ocean**: Open http://localhost:8080/blue

---

## Detailed Setup Guide

### 1. Docker Setup

Docker Desktop provides the container runtime for building and running containers.

```bash
# Install Docker Desktop
brew install --cask docker

# Start Docker Desktop from Applications
# Verify installation
docker --version
docker run hello-world
```

### 2. Minikube Setup

Minikube creates a local Kubernetes cluster for deployment.

```bash
# Install Minikube
brew install minikube

# Start Minikube with Docker driver
minikube start --driver=docker --cpus=2 --memory=4096

# Enable required addons
minikube addons enable dashboard
minikube addons enable metrics-server
minikube addons enable ingress

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

### 3. Jenkins Setup

Jenkins is our primary CI/CD tool.

```bash
# Install Jenkins LTS
brew install jenkins-lts

# Start Jenkins
brew services start jenkins-lts

# Get initial admin password
cat ~/.jenkins/secrets/initialAdminPassword
```

**Required Jenkins Plugins:**
1. Docker Pipeline
2. Kubernetes
3. Blue Ocean
4. Email Extension Plugin
5. Pipeline
6. Git


---

## Pipeline Overview

### Jenkins Pipeline Stages

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Checkout   │──▶│   Install   │──▶│    Code     │
│    Code     │   │Dependencies │   │   Quality   │
└─────────────┘   └─────────────┘   └─────────────┘
                                           │
                                           ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Deploy    │◀──│    Build    │◀──│    Unit     │
│  Minikube   │   │   Docker    │   │    Tests    │
└─────────────┘   └─────────────┘   └─────────────┘
       │
       ▼
┌─────────────┐   ┌─────────────┐
│    Smoke    │──▶│   Email     │
│    Tests    │   │Notification │
└─────────────┘   └─────────────┘
```

### Pipeline Stages Description

| Stage | Description |
|-------|-------------|
| Checkout | Clone source code from Git repository |
| Install Dependencies | Run `npm ci` to install Node.js packages |
| Code Quality | Run linting and code quality checks |
| Unit Tests | Execute Jest unit tests |
| Build Docker | Build container image using Dockerfile |
| Security Scan | Scan image for vulnerabilities using Trivy |
| Deploy to Minikube | Apply Kubernetes manifests and deploy |
| Smoke Tests | Verify deployment is responding |
| Email Notification | Send build status via email |

---

## Additional Features

### 1. Visual Tools/Dashboard

#### Kubernetes Dashboard
```bash
# Enable and open dashboard
minikube dashboard
```

The dashboard provides:
- Pod status and health monitoring
- Resource usage graphs (CPU, Memory)
- Log viewing
- Service and deployment management

#### Jenkins Blue Ocean
Access at: http://localhost:8080/blue

Features:
- Visual pipeline editor
- Real-time pipeline execution view
- Branch and PR management
- Easy navigation between builds

### 2. Jenkins Email Notification

Email notifications are configured in the Jenkinsfile post-build section.

**Setup Steps:**
1. Go to Manage Jenkins → System
2. Configure Extended E-mail Notification:
   - SMTP Server: `smtp.gmail.com`
   - SMTP Port: `465`
   - Enable SSL
   - Add credentials (Gmail App Password)

**Email Triggers:**
- ✅ Success: Green notification with deployment details
- ❌ Failure: Red alert with error information
- ⚠️ Unstable: Warning notification for partial issues

### 3. GitHub Actions (Alternative CI/CD)

Located at: `.github/workflows/ci-cd.yml`

This workflow provides:
- Automated builds on push/PR
- Parallel job execution
- Minikube deployment
- Security scanning

**Trigger the workflow:**
```bash
git push origin main
```


---

## Project Structure

```
devops-taskboard/
├── Dockerfile              # Docker build configuration
├── .dockerignore           # Files to exclude from build
├── Jenkinsfile             # Jenkins pipeline definition
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # GitHub Actions workflow
├── k8s/
│   ├── deployment.yaml     # Kubernetes Deployment & Service
│   ├── dashboard.yaml      # Dashboard configuration
│   └── namespace.yaml      # Namespace & resource quotas
├── dashboard/
│   ├── README.md           # Dashboard setup guide
│   └── setup-dashboard.sh  # Dashboard setup script
├── scripts/
│   ├── install-tools.sh    # Install all CI/CD tools
│   ├── start-minikube.sh   # Start and configure Minikube
│   ├── start-jenkins.sh    # Start and configure Jenkins
│   ├── build-and-deploy.sh # Quick deploy script
│   └── cleanup.sh          # Cleanup resources
├── index.js                # Main application
├── utils/                  # Utility functions
├── models/                 # Data models
└── public/                 # Frontend files
```

---

## Kubernetes Resources

### Deployment

The application is deployed with:
- 2 replicas for high availability
- Rolling update strategy
- Resource limits (CPU: 500m, Memory: 256Mi)
- Health checks (liveness and readiness probes)

### Service

- Type: NodePort
- Port: 80 → 3000
- NodePort: 30080

### Horizontal Pod Autoscaler

- Min replicas: 2
- Max replicas: 5
- Scale on: 70% CPU or 80% Memory

---

## Commands Reference

### Docker Commands
```bash
docker build -t devops-taskboard:latest .
docker run -d -p 3000:3000 devops-taskboard:latest
docker ps
docker logs <container-id>
```

### Minikube Commands
```bash
minikube start --driver=docker
minikube status
minikube dashboard
minikube service devops-taskboard-service
minikube stop
minikube delete
```

### Kubectl Commands
```bash
kubectl get pods
kubectl get services
kubectl get deployments
kubectl logs -l app=devops-taskboard
kubectl describe pod <pod-name>
kubectl rollout status deployment/devops-taskboard
kubectl rollout restart deployment/devops-taskboard
```

### Jenkins Commands
```bash
brew services start jenkins-lts
brew services stop jenkins-lts
brew services restart jenkins-lts
```


---

## Troubleshooting

### Docker Issues

**Docker not running:**
```bash
# Start Docker Desktop from Applications
open -a Docker
```

**Permission denied:**
```bash
# Restart Docker Desktop
# Or check Docker group membership
```

### Minikube Issues

**Minikube won't start:**
```bash
minikube delete
minikube start --driver=docker
```

**Image pull errors:**
```bash
# Use Minikube's Docker daemon
eval $(minikube docker-env)
docker build -t devops-taskboard:latest .
```

### Jenkins Issues

**Can't access Jenkins:**
```bash
# Check if running
brew services list | grep jenkins

# Restart
brew services restart jenkins-lts
```

**Plugin issues:**
```bash
# Restart Jenkins after plugin installation
brew services restart jenkins-lts
```

### Kubernetes Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

**Service not accessible:**
```bash
minikube service devops-taskboard-service --url
```

---

## Report Screenshots Guide

For your project report, capture these screenshots:

1. **Jenkins Dashboard** - Main Jenkins view with job list
2. **Jenkins Blue Ocean** - Pipeline visualization
3. **Pipeline Execution** - Running pipeline stages
4. **Email Notification** - Sample email received
5. **Kubernetes Dashboard** - Cluster overview
6. **Pod Status** - Running pods view
7. **GitHub Actions** - Workflow run visualization
9. **Application Running** - Browser showing the taskboard

---

## Author

DevOps Taskboard Project - Part 3
CI/CD Pipeline Implementation

---

## License

ISC License
