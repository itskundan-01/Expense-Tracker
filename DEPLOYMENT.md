# Expense Tracker - Kubernetes & Ansible Deployment Guide

## 📋 Overview

This guide covers the deployment of the Expense Tracker full-stack application using:
- **Kubernetes** for container orchestration
- **Ansible** for automation
- **Docker** for containerization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Namespace: expense-tracker          │    │
│  │                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│  │  │  Frontend   │  │   Backend   │  │    MySQL    │ │    │
│  │  │  (React)    │  │ (Spring Boot)│  │  Database   │ │    │
│  │  │  Replicas:2 │  │  Replicas:2 │  │  Replicas:1 │ │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │    │
│  │         │                │                │         │    │
│  │  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐ │    │
│  │  │  Service    │  │  Service    │  │  Service    │ │    │
│  │  │ NodePort:   │  │ ClusterIP   │  │  Headless   │ │    │
│  │  │  30080      │  │  :8080      │  │   :3306     │ │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│  │                                                      │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │              Ingress Controller               │  │    │
│  │  │         expense-tracker.local                 │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
Expense-Tracker/
├── k8s/                          # Kubernetes manifests
│   ├── namespace.yaml            # Namespace definition
│   ├── mysql-secret.yaml         # MySQL credentials
│   ├── mysql-configmap.yaml      # MySQL configuration
│   ├── mysql-pv.yaml             # Persistent Volume
│   ├── mysql-deployment.yaml     # MySQL deployment + service
│   ├── backend-secret.yaml       # Backend secrets (JWT, DB)
│   ├── backend-configmap.yaml    # Backend configuration
│   ├── backend-deployment.yaml   # Backend deployment + service
│   ├── frontend-configmap.yaml   # Frontend nginx config
│   ├── frontend-deployment.yaml  # Frontend deployment + service
│   ├── ingress.yaml              # Ingress rules
│   ├── kustomization.yaml        # Kustomize configuration
│   └── deploy.sh                 # Deployment script
│
├── ansible/                      # Ansible automation
│   ├── ansible.cfg               # Ansible configuration
│   ├── inventory.ini             # Host inventory
│   ├── requirements.yml          # Ansible collections
│   ├── site.yml                  # Main playbook
│   ├── build.yml                 # Build images playbook
│   ├── cleanup.yml               # Cleanup playbook
│   ├── run.sh                    # Runner script
│   ├── group_vars/
│   │   └── all.yml               # Global variables
│   └── tasks/
│       ├── check_prerequisites.yml
│       ├── build_images.yml
│       ├── deploy_kubernetes.yml
│       ├── wait_deployments.yml
│       └── show_status.yml
│
├── server/                       # Spring Boot backend
│   └── Dockerfile
│
└── client/                       # React frontend
    └── Dockerfile
```

## 🚀 Quick Start

### Prerequisites

1. **Docker** (20.10+)
2. **Kubernetes cluster** (minikube, kind, or cloud)
3. **kubectl** configured
4. **Ansible** (2.14+) - for automation

### Option 1: Using Kubernetes Directly

```bash
# Navigate to k8s directory
cd k8s

# Make script executable
chmod +x deploy.sh

# Full deployment (build + deploy)
./deploy.sh full

# Or deploy only (if images already built)
./deploy.sh deploy

# Check status
./deploy.sh status

# Cleanup
./deploy.sh cleanup
```

### Option 2: Using Ansible Automation

```bash
# Navigate to ansible directory
cd ansible

# Make script executable
chmod +x run.sh

# Install required Ansible collections
./run.sh install

# Run full deployment
./run.sh full

# Or use interactive menu
./run.sh
```

## 📦 Kubernetes Components

### Namespaces & Resources

| Resource | Name | Purpose |
|----------|------|---------|
| Namespace | expense-tracker | Isolate application resources |
| Secret | mysql-secret | MySQL credentials |
| Secret | backend-secret | JWT secret, DB credentials |
| ConfigMap | mysql-configmap | Database name |
| ConfigMap | backend-configmap | Spring Boot config |
| ConfigMap | frontend-configmap | Nginx configuration |
| PV/PVC | mysql-pv/mysql-pvc | Persistent storage for MySQL |

### Deployments

| Deployment | Replicas | Image | Port |
|------------|----------|-------|------|
| mysql | 1 | mysql:8.0 | 3306 |
| backend | 2 | expense-tracker-backend:latest | 8080 |
| frontend | 2 | expense-tracker-frontend:latest | 80 |

### Services

| Service | Type | Port | Target |
|---------|------|------|--------|
| mysql-service | ClusterIP (Headless) | 3306 | MySQL pod |
| backend-service | ClusterIP | 8080 | Backend pods |
| frontend-service | NodePort | 80→30080 | Frontend pods |

## 🔧 Configuration

### MySQL Credentials (mysql-secret.yaml)
```yaml
# Base64 encoded
mysql-root-password: SW1LdW5kYW4=  # ImKundan
mysql-database: ZXhwZW5zZV90cmFja2Vy  # expense_tracker
```

### Backend Environment
```yaml
SPRING_PROFILES_ACTIVE: prod
SPRING_DATASOURCE_URL: jdbc:mysql://mysql-service:3306/expense_tracker
JWT_SECRET: <base64-encoded>
```

## 🌐 Accessing the Application

### Using Minikube
```bash
minikube service frontend-service -n expense-tracker
```

### Using Kind
```bash
kubectl port-forward service/frontend-service 8080:80 -n expense-tracker
# Access at http://localhost:8080
```

### Using NodePort
```bash
# Get node IP
kubectl get nodes -o wide

# Access at http://<node-ip>:30080
```

### Using Ingress
Add to `/etc/hosts`:
```
<cluster-ip> expense-tracker.local
```
Then access: http://expense-tracker.local

## 📊 Monitoring & Debugging

### Check Pod Status
```bash
kubectl get pods -n expense-tracker
kubectl describe pod <pod-name> -n expense-tracker
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/backend -n expense-tracker

# Frontend logs
kubectl logs -f deployment/frontend -n expense-tracker

# MySQL logs
kubectl logs -f deployment/mysql -n expense-tracker
```

### Execute Commands in Pods
```bash
# Access MySQL shell
kubectl exec -it deployment/mysql -n expense-tracker -- mysql -u root -p

# Access backend shell
kubectl exec -it deployment/backend -n expense-tracker -- /bin/sh
```

## 🧹 Cleanup

### Using kubectl
```bash
kubectl delete -k k8s/
```

### Using Ansible
```bash
cd ansible && ./run.sh cleanup
```

### Manual Cleanup
```bash
kubectl delete namespace expense-tracker
kubectl delete pv mysql-pv
```

## 🔒 Security Features

- ✅ Secrets for sensitive data (passwords, JWT)
- ✅ Non-root containers
- ✅ Resource limits defined
- ✅ Health checks (liveness/readiness probes)
- ✅ Network policies ready

## 📝 CI/CD Integration

This setup is CI/CD ready:

1. **Build Stage**: Use `ansible/build.yml` or `k8s/deploy.sh build`
2. **Deploy Stage**: Use `ansible/site.yml` or `k8s/deploy.sh deploy`
3. **Test Stage**: Health endpoints at `/api/health`
4. **Cleanup Stage**: Use `ansible/cleanup.yml`

## 🆘 Troubleshooting

### Pods Not Starting
```bash
kubectl describe pod <pod-name> -n expense-tracker
kubectl logs <pod-name> -n expense-tracker
```

### MySQL Connection Issues
```bash
# Check if MySQL is ready
kubectl get pods -l app=mysql -n expense-tracker
kubectl logs deployment/mysql -n expense-tracker
```

### Backend Can't Connect to Database
```bash
# Check service discovery
kubectl exec -it deployment/backend -n expense-tracker -- nslookup mysql-service
```

## 👥 Team Information

- **Project**: Expense Tracker Full-Stack Application
- **Stack**: React + Spring Boot + MySQL
- **Deployment**: Kubernetes + Ansible

---

**Review Date**: 28.11.2025
