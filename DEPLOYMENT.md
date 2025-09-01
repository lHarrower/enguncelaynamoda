# AYNAMODA Deployment Rehberi 🚀

> **Faz 1: "Çelik Çekirdek" Operasyonu** - Production-Ready Infrastructure

Bu rehber, AYNAMODA projesinin GCP üzerinde tam otomatik deployment sürecini açıklar.

## 📋 İçindekiler

- [Ön Gereksinimler](#ön-gereksinimler)
- [GCP Kurulumu](#gcp-kurulumu)
- [GitHub Actions Kurulumu](#github-actions-kurulumu)
- [Terraform Deployment](#terraform-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Domain ve SSL Kurulumu](#domain-ve-ssl-kurulumu)
- [Monitoring Kurulumu](#monitoring-kurulumu)
- [Troubleshooting](#troubleshooting)

## 🔧 Ön Gereksinimler

### Yerel Geliştirme Ortamı

```bash
# Gerekli araçları yükleyin
brew install google-cloud-sdk terraform kubectl

# Veya Linux/Windows için:
# https://cloud.google.com/sdk/docs/install
# https://www.terraform.io/downloads
# https://kubernetes.io/docs/tasks/tools/
```

### Hesap Gereksinimleri

- Google Cloud Platform hesabı
- GitHub hesabı (repository admin yetkisi ile)
- Domain name (opsiyonel, test için kullanılabilir)

## ☁️ GCP Kurulumu

### 1. Proje Oluşturma

```bash
# GCP'ye giriş yapın
gcloud auth login

# Yeni proje oluşturun
export PROJECT_ID="aynamoda-$(date +%s)"
gcloud projects create $PROJECT_ID
gcloud config set project $PROJECT_ID

# Billing hesabını bağlayın (gerekli)
gcloud billing accounts list
gcloud billing projects link $PROJECT_ID --billing-account=BILLING_ACCOUNT_ID
```

### 2. API'leri Etkinleştirme

```bash
# Gerekli API'leri etkinleştirin
gcloud services enable \
  container.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  storage.googleapis.com \
  artifactregistry.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  servicenetworking.googleapis.com
```

### 3. Service Account Oluşturma

```bash
# Terraform için service account
gcloud iam service-accounts create aynamoda-terraform \
  --display-name="AYNAMODA Terraform Service Account" \
  --description="Service account for Terraform infrastructure management"

# Gerekli rolleri atayın
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:aynamoda-terraform@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:aynamoda-terraform@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/container.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:aynamoda-terraform@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.admin"

# Service account key oluşturun
gcloud iam service-accounts keys create terraform-key.json \
  --iam-account=aynamoda-terraform@$PROJECT_ID.iam.gserviceaccount.com
```

### 4. Terraform State Bucket

```bash
# Terraform state için bucket oluşturun
gsutil mb gs://$PROJECT_ID-terraform-state
gsutil versioning set on gs://$PROJECT_ID-terraform-state

# Bucket'ı sadece service account'a erişilebilir yapın
gsutil iam ch serviceAccount:aynamoda-terraform@$PROJECT_ID.iam.gserviceaccount.com:objectAdmin gs://$PROJECT_ID-terraform-state
```

## 🔐 GitHub Actions Kurulumu

### 1. Repository Secrets

GitHub repository'nizde **Settings > Secrets and variables > Actions** bölümünden şu secrets'ları ekleyin:

```bash
# Temel secrets
GCP_PROJECT_ID=$PROJECT_ID
GCP_SA_KEY=$(cat terraform-key.json | base64 -w 0)  # Linux
GCP_SA_KEY=$(cat terraform-key.json | base64)     # macOS
TF_STATE_BUCKET=$PROJECT_ID-terraform-state

# Güvenlik secrets (güçlü şifreler oluşturun)
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
REDIS_PASSWORD=$(openssl rand -base64 32)

# SMTP ayarları (opsiyonel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Domain ayarları
DOMAIN_NAME=aynamoda.com
API_SUBDOMAIN=api.dev
```

### 2. Environment Variables

Repository'nizde **Settings > Environments** bölümünden şu environment'ları oluşturun:

- `development`
- `staging` 
- `production`

Her environment için gerekli variables'ları ayarlayın.

## 🏗️ Terraform Deployment

### 1. Terraform Konfigürasyonu

```bash
cd infrastructure/terraform

# terraform.tfvars dosyasını oluşturun
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` dosyasını düzenleyin:

```hcl
# terraform.tfvars
project_id = "your-project-id"
region     = "europe-west1"
environment = "development"

# GKE ayarları
gke_num_nodes    = 2
gke_machine_type = "e2-standard-2"
gke_min_nodes    = 1
gke_max_nodes    = 5

# Database ayarları
db_tier     = "db-f1-micro"
db_user     = "aynamoda_user"
db_password = "your-secure-password"

# Domain ayarları
domain_name    = "aynamoda.com"
api_subdomain  = "api.dev"

# SSL sertifika domainleri
ssl_domains = [
  "api.dev.aynamoda.com",
  "grafana.dev.aynamoda.com"
]

# Monitoring
enable_monitoring = true
log_retention_days = 30

# Backup
backup_retention_days = 7

# Network
vpc_cidr      = "10.0.0.0/16"
subnet_cidr   = "10.0.1.0/24"
pods_cidr     = "10.1.0.0/16"
services_cidr = "10.2.0.0/16"

# Labels
labels = {
  project     = "aynamoda"
  environment = "development"
  team        = "backend"
  managed_by  = "terraform"
}
```

### 2. Terraform Çalıştırma

```bash
# Backend'i başlatın
terraform init -backend-config="bucket=$PROJECT_ID-terraform-state"

# Planı kontrol edin
terraform plan

# Altyapıyı oluşturun
terraform apply

# Çıktıları kaydedin
terraform output > ../outputs.txt
```

### 3. Kubernetes Credentials

```bash
# GKE cluster'a bağlanın
gcloud container clusters get-credentials aynamoda-cluster \
  --region europe-west1 \
  --project $PROJECT_ID

# Cluster durumunu kontrol edin
kubectl cluster-info
kubectl get nodes
```

## ☸️ Kubernetes Deployment

### 1. Namespace'leri Oluşturma

```bash
cd infrastructure/k8s

# Namespace'leri oluşturun
kubectl apply -f namespace.yaml

# Namespace'leri kontrol edin
kubectl get namespaces
```

### 2. ConfigMap ve Secrets

```bash
# ConfigMap'i oluşturun
kubectl apply -f configmap-secret.yaml

# Secret'ları manuel olarak oluşturun (GitHub Actions otomatik yapacak)
kubectl create secret generic aynamoda-secrets \
  --from-literal=DB_PASSWORD="$DB_PASSWORD" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=REDIS_PASSWORD="$REDIS_PASSWORD" \
  -n aynamoda-dev
```

### 3. API Deployment

```bash
# API'yi deploy edin (ilk kez manuel, sonra GitHub Actions)
kubectl apply -f api-deployment.yaml

# Deployment durumunu kontrol edin
kubectl get deployments -n aynamoda-dev
kubectl get pods -n aynamoda-dev
kubectl get services -n aynamoda-dev
```

### 4. Ingress ve SSL

```bash
# Ingress'i oluşturun
kubectl apply -f ingress.yaml

# SSL sertifikasının durumunu kontrol edin
kubectl get managedcertificate -n aynamoda-dev
kubectl describe managedcertificate aynamoda-ssl-cert -n aynamoda-dev

# Ingress IP'sini alın
kubectl get ingress -n aynamoda-dev
```

## 🌐 Domain ve SSL Kurulumu

### 1. DNS Ayarları

```bash
# Static IP'yi alın
INGRESS_IP=$(kubectl get ingress aynamoda-ingress -n aynamoda-dev -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ingress IP: $INGRESS_IP"

# DNS kayıtlarını oluşturun (domain sağlayıcınızda)
# A record: api.dev.aynamoda.com -> $INGRESS_IP
# A record: grafana.dev.aynamoda.com -> $INGRESS_IP
```

### 2. SSL Sertifika Doğrulama

```bash
# SSL sertifikasının hazır olmasını bekleyin (5-10 dakika)
kubectl wait --for=condition=Active managedcertificate/aynamoda-ssl-cert -n aynamoda-dev --timeout=600s

# Sertifika durumunu kontrol edin
kubectl describe managedcertificate aynamoda-ssl-cert -n aynamoda-dev

# API'yi test edin
curl -k https://api.dev.aynamoda.com/health
```

## 📊 Monitoring Kurulumu

### 1. Monitoring Stack

```bash
# Monitoring namespace ve stack'i deploy edin
kubectl apply -f monitoring.yaml

# Monitoring pod'larını kontrol edin
kubectl get pods -n monitoring

# Prometheus'a erişim için port forward
kubectl port-forward -n monitoring svc/prometheus 9090:9090 &

# Grafana'ya erişim için port forward
kubectl port-forward -n monitoring svc/grafana 3000:3000 &
```

### 2. Grafana Kurulumu

```bash
# Grafana admin şifresini alın
kubectl get secret grafana-admin-secret -n monitoring -o jsonpath='{.data.password}' | base64 -d

# Grafana'ya erişin: http://localhost:3000
# Username: admin
# Password: yukarıdaki komuttan alınan şifre
```

### 3. Alert Konfigürasyonu

```bash
# AlertManager konfigürasyonunu kontrol edin
kubectl get configmap alertmanager-config -n monitoring -o yaml

# Alert kurallarını kontrol edin
kubectl get prometheusrule -n monitoring
```

## 🔄 GitHub Actions Workflow

### 1. Otomatik Deployment

GitHub Actions workflow'ları otomatik olarak:

- `main` branch'e push'ta production deployment
- `develop` branch'e push'ta development deployment
- Pull request'lerde Terraform plan

### 2. Manual Deployment

```bash
# GitHub Actions'dan manuel deployment tetikleme
# Repository > Actions > Deploy API > Run workflow
```

### 3. Rollback

```bash
# Önceki versiyona rollback
kubectl rollout undo deployment/aynamoda-api -n aynamoda-dev

# Belirli bir revision'a rollback
kubectl rollout undo deployment/aynamoda-api -n aynamoda-dev --to-revision=2

# Rollout geçmişini görüntüle
kubectl rollout history deployment/aynamoda-api -n aynamoda-dev
```

## 🔍 Troubleshooting

### 1. Genel Kontroller

```bash
# Cluster durumu
kubectl cluster-info
kubectl get nodes
kubectl top nodes

# Pod durumları
kubectl get pods -A
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>

# Service durumları
kubectl get services -A
kubectl describe service <service-name> -n <namespace>
```

### 2. Database Bağlantı Sorunları

```bash
# Cloud SQL Proxy ile test
cloud_sql_proxy -instances=$PROJECT_ID:europe-west1:aynamoda-postgres=tcp:5432 &
psql -h 127.0.0.1 -U aynamoda_user -d aynamoda

# Pod içinden database testi
kubectl exec -it <api-pod-name> -n aynamoda-dev -- /bin/sh
# Pod içinde: nc -zv <db-host> 5432
```

### 3. SSL Sertifika Sorunları

```bash
# Managed Certificate durumu
kubectl describe managedcertificate aynamoda-ssl-cert -n aynamoda-dev

# DNS propagation kontrolü
nslookup api.dev.aynamoda.com
dig api.dev.aynamoda.com

# SSL sertifika testi
openssl s_client -connect api.dev.aynamoda.com:443 -servername api.dev.aynamoda.com
```

### 4. Ingress Sorunları

```bash
# Ingress durumu
kubectl describe ingress aynamoda-ingress -n aynamoda-dev

# Ingress controller logları
kubectl logs -n kube-system -l k8s-app=glbc

# Backend service durumu
kubectl get endpoints -n aynamoda-dev
```

### 5. Monitoring Sorunları

```bash
# Prometheus targets
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# http://localhost:9090/targets adresini kontrol edin

# Grafana datasource
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Grafana > Configuration > Data Sources > Prometheus
```

## 📈 Performance Tuning

### 1. Resource Limits

```yaml
# api-deployment.yaml içinde
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### 2. HPA (Horizontal Pod Autoscaler)

```bash
# HPA oluştur
kubectl autoscale deployment aynamoda-api --cpu-percent=70 --min=2 --max=10 -n aynamoda-dev

# HPA durumunu kontrol et
kubectl get hpa -n aynamoda-dev
```

### 3. Database Connection Pooling

```go
// internal/database/database.go içinde
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(5)
db.SetConnMaxLifetime(5 * time.Minute)
```

## 🔒 Güvenlik Best Practices

### 1. Network Policies

```bash
# Network policy'leri uygula
kubectl apply -f ingress.yaml  # NetworkPolicy dahil

# Network policy'leri kontrol et
kubectl get networkpolicies -n aynamoda-dev
```

### 2. RBAC

```bash
# Service account permissions
kubectl describe serviceaccount aynamoda-api-sa -n aynamoda-dev
kubectl describe role aynamoda-api-role -n aynamoda-dev
kubectl describe rolebinding aynamoda-api-binding -n aynamoda-dev
```

### 3. Secrets Management

```bash
# Secret'ları güvenli şekilde yönet
kubectl create secret generic aynamoda-secrets \
  --from-env-file=.env.production \
  -n aynamoda-dev

# Secret'ları kontrol et (değerleri göstermez)
kubectl get secrets -n aynamoda-dev
```

## 📋 Checklist

### Deployment Öncesi

- [ ] GCP projesi oluşturuldu
- [ ] Gerekli API'ler etkinleştirildi
- [ ] Service account ve key oluşturuldu
- [ ] Terraform state bucket oluşturuldu
- [ ] GitHub secrets ayarlandı
- [ ] Domain DNS ayarları yapıldı

### Deployment Sonrası

- [ ] Terraform apply başarılı
- [ ] GKE cluster erişilebilir
- [ ] Kubernetes manifests uygulandı
- [ ] API pod'ları çalışıyor
- [ ] Database bağlantısı çalışıyor
- [ ] SSL sertifikası aktif
- [ ] Health check endpoint'i erişilebilir
- [ ] Monitoring stack çalışıyor
- [ ] GitHub Actions workflow'ları çalışıyor

### Test Checklist

- [ ] `curl https://api.dev.aynamoda.com/health` - 200 OK
- [ ] `curl https://api.dev.aynamoda.com/metrics` - Prometheus metrics
- [ ] Grafana dashboard'ları yükleniyor
- [ ] Alert'ler çalışıyor
- [ ] Database migration'ları tamamlandı
- [ ] File upload çalışıyor (GCS)
- [ ] Authentication flow çalışıyor

---

## 🎉 Tebrikler!

**Faz 1: "Çelik Çekirdek" Operasyonu** başarıyla tamamlandı! 🚀

Artık elinizde:
- ✅ Production-ready Go API
- ✅ Otomatik CI/CD pipeline
- ✅ Scalable GKE infrastructure
- ✅ Comprehensive monitoring
- ✅ Secure SSL endpoints
- ✅ Database backup strategy

**Sırada:** Faz 2 "İlk Işık" - React Native frontend entegrasyonu! 📱✨

---

**"Sakin Teknoloji ile Dişil Zarafeti Birleştiriyoruz"** 🌸✨