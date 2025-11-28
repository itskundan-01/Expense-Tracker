#!/bin/bash

# Expense Tracker - Ansible Deployment Runner
# This script provides an easy way to run Ansible playbooks

set -e

# Add Docker Desktop to PATH for macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "=========================================="
echo "   Expense Tracker Ansible Deployment"
echo "=========================================="
echo -e "${NC}"

# Check Ansible installation
check_ansible() {
    if ! command -v ansible &> /dev/null; then
        echo -e "${RED}Ansible is not installed.${NC}"
        echo "Install with: pip install ansible"
        exit 1
    fi
    echo -e "${GREEN}✓ Ansible is installed${NC}"
}

# Install Ansible collections
install_collections() {
    echo -e "${YELLOW}Installing required Ansible collections...${NC}"
    ansible-galaxy collection install -r requirements.yml
    echo -e "${GREEN}✓ Collections installed${NC}"
}

# Run playbook
run_playbook() {
    local playbook=$1
    local tags=$2
    
    echo -e "${YELLOW}Running playbook: ${playbook}${NC}"
    
    if [ -n "$tags" ]; then
        ansible-playbook "$playbook" --tags "$tags" -v
    else
        ansible-playbook "$playbook" -v
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "Select an action:"
    echo "  1) Full Deployment (Build + Deploy to K8s)"
    echo "  2) Build Docker Images Only"
    echo "  3) Deploy to Kubernetes Only"
    echo "  4) Show Kubernetes Status"
    echo "  5) Deploy with Docker Compose (Port 3000)"
    echo "  6) Stop Docker Compose"
    echo "  7) Cleanup All Resources"
    echo "  8) Install Ansible Collections"
    echo "  9) Exit"
    echo ""
    read -p "Enter choice [1-9]: " choice
    
    case $choice in
        1)
            run_playbook "site.yml" "full"
            ;;
        2)
            run_playbook "build.yml"
            ;;
        3)
            run_playbook "site.yml" "deploy"
            ;;
        4)
            run_playbook "site.yml" "status"
            ;;
        5)
            run_playbook "deploy-compose.yml"
            ;;
        6)
            echo -e "${YELLOW}Stopping Docker Compose services...${NC}"
            docker compose -f docker-compose.yml down
            echo -e "${GREEN}✓ Services stopped${NC}"
            ;;
        7)
            run_playbook "cleanup.yml"
            ;;
        8)
            install_collections
            ;;
        9)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            show_menu
            ;;
    esac
}

# Handle command line arguments
if [ $# -gt 0 ]; then
    case $1 in
        "full")
            check_ansible
            run_playbook "site.yml" "full"
            ;;
        "build")
            check_ansible
            run_playbook "build.yml"
            ;;
        "deploy")
            check_ansible
            run_playbook "site.yml" "deploy"
            ;;
        "status")
            check_ansible
            run_playbook "site.yml" "status"
            ;;
        "compose")
            check_ansible
            run_playbook "deploy-compose.yml"
            ;;
        "compose-down")
            echo -e "${YELLOW}Stopping Docker Compose services...${NC}"
            docker compose -f docker-compose.yml down
            echo -e "${GREEN}✓ Services stopped${NC}"
            ;;
        "cleanup")
            check_ansible
            run_playbook "cleanup.yml"
            ;;
        "install")
            check_ansible
            install_collections
            ;;
        "prerequisites")
            check_ansible
            run_playbook "site.yml" "prerequisites"
            ;;
        *)
            echo "Usage: $0 {full|build|deploy|status|compose|compose-down|cleanup|install|prerequisites}"
            exit 1
            ;;
    esac
else
    check_ansible
    show_menu
fi

echo -e "\n${GREEN}Done!${NC}"
