# ==============================================================================
# Podman Configuration for DevOps Taskboard
# Alternative Containerization Tool
# ==============================================================================

# This file provides equivalent Podman commands for building and running
# the DevOps Taskboard application as an alternative to Docker.

# ==============================================================================
# PODMAN BUILD COMMANDS
# ==============================================================================

# Build the image using Podman (uses the same Dockerfile)
# podman build -t devops-taskboard:latest .

# Build with specific tag
# podman build -t devops-taskboard:v1.0.0 .

# Build with build arguments
# podman build --build-arg NODE_ENV=production -t devops-taskboard:latest .

# ==============================================================================
# PODMAN RUN COMMANDS
# ==============================================================================

# Run container in foreground
# podman run -p 3000:3000 --name taskboard devops-taskboard:latest

# Run container in background (detached)
# podman run -d -p 3000:3000 --name taskboard devops-taskboard:latest

# Run with environment variables
# podman run -d -p 3000:3000 -e NODE_ENV=production --name taskboard devops-taskboard:latest

# Run with volume mount for development
# podman run -d -p 3000:3000 -v ./utils:/app/utils:Z --name taskboard devops-taskboard:latest

# ==============================================================================
# PODMAN COMPOSE EQUIVALENT
# ==============================================================================

# Podman supports docker-compose files via podman-compose
# Install: pip install podman-compose
# Run: podman-compose up -d

# ==============================================================================
# PODMAN POD COMMANDS (Alternative to docker-compose)
# ==============================================================================

# Create a pod
# podman pod create --name taskboard-pod -p 3000:3000

# Run container in pod
# podman run -d --pod taskboard-pod --name taskboard-app devops-taskboard:latest

# ==============================================================================
# USEFUL PODMAN COMMANDS
# ==============================================================================

# List running containers
# podman ps

# List all containers
# podman ps -a

# List images
# podman images

# View logs
# podman logs taskboard

# Stop container
# podman stop taskboard

# Remove container
# podman rm taskboard

# Remove image
# podman rmi devops-taskboard:latest

# Inspect container
# podman inspect taskboard

# Execute command in running container
# podman exec -it taskboard /bin/sh

# ==============================================================================
# PODMAN GENERATE KUBERNETES MANIFESTS
# ==============================================================================

# One of Podman's unique features is generating Kubernetes YAML from containers
# This is useful for migrating from containers to Kubernetes

# Generate Kubernetes YAML from running container
# podman generate kube taskboard > generated-k8s.yaml

# Generate from pod
# podman generate kube taskboard-pod > generated-k8s.yaml

# ==============================================================================
# PODMAN SYSTEMD INTEGRATION
# ==============================================================================

# Generate systemd unit file for container
# podman generate systemd --name taskboard > taskboard.service

# Enable container to start on boot (as user service)
# systemctl --user enable taskboard.service
