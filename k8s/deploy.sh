#!/bin/bash

# Expense Tracker Kubernetes Deployment Script
# This script builds Docker images and deploys to Kubernetes

set -e

# Add Docker Desktop to PATH for macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
fi

echo "🚀 Expense Tracker Kubernetes Deployment"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed or not in PATH.${NC}"
        echo -e "${RED}If using Docker Desktop on macOS, ensure it's running.${NC}"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All prerequisites met${NC}"
}

# Build Docker images
build_images() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    
    # Build backend image
    echo "Building backend image..."
    cd ../server
    docker build -t expense-tracker-backend:latest .
    
    # Build frontend image
    echo "Building frontend image..."
    cd ../client
    docker build -t expense-tracker-frontend:latest .
    
    cd ../k8s
    echo -e "${GREEN}✓ Docker images built successfully${NC}"
}

# Deploy to Kubernetes
deploy() {
    echo -e "${YELLOW}Deploying to Kubernetes...${NC}"
    
    # Apply all manifests using kustomize
    kubectl apply -k .
    
    echo -e "${GREEN}✓ Deployment initiated${NC}"
}

# Wait for deployments
wait_for_deployments() {
    echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"
    
    kubectl wait --for=condition=ready pod -l app=mysql -n expense-tracker --timeout=120s || true
    kubectl wait --for=condition=ready pod -l app=backend -n expense-tracker --timeout=180s || true
    kubectl wait --for=condition=ready pod -l app=frontend -n expense-tracker --timeout=120s || true
    
    echo -e "${GREEN}✓ All deployments are ready${NC}"
}

# Show status
show_status() {
    echo -e "${YELLOW}Deployment Status:${NC}"
    echo "==================="
    
    echo -e "\n${GREEN}Pods:${NC}"
    kubectl get pods -n expense-tracker
    
    echo -e "\n${GREEN}Services:${NC}"
    kubectl get services -n expense-tracker
    
    echo -e "\n${GREEN}Ingress:${NC}"
    kubectl get ingress -n expense-tracker
    
    # Get NodePort URL
    NODE_PORT=$(kubectl get service frontend-service -n expense-tracker -o jsonpath='{.spec.ports[0].nodePort}')
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}')
    
    echo -e "\n${GREEN}Access the application:${NC}"
    echo "  Frontend: http://${NODE_IP}:${NODE_PORT}"
    echo "  Or if using minikube: minikube service frontend-service -n expense-tracker"
}

# Cleanup function
cleanup() {
    echo -e "${YELLOW}Cleaning up Kubernetes resources...${NC}"
    kubectl delete -k . --ignore-not-found=true
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Main execution
case "${1:-deploy}" in
    "build")
        check_prerequisites
        build_images
        ;;
    "deploy")
        check_prerequisites
        deploy
        wait_for_deployments
        show_status
        ;;
    "full")
        check_prerequisites
        build_images
        deploy
        wait_for_deployments
        show_status
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {build|deploy|full|status|cleanup}"
        echo "  build   - Build Docker images only"
        echo "  deploy  - Deploy to Kubernetes (default)"
        echo "  full    - Build images and deploy"
        echo "  status  - Show deployment status"
        echo "  cleanup - Remove all Kubernetes resources"
        exit 1
        ;;
esac

echo -e "\n${GREEN}Done!${NC}"
