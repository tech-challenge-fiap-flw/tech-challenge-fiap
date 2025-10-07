# Namespace
resource "kubernetes_namespace" "tech_challenge" {
  metadata {
    name = var.namespace
  }
}

# ConfigMap
resource "kubernetes_config_map" "app_config" {
  metadata {
    name = "app-config"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
  }

  data = {
    DB_HOST = "mysql-service"
    DB_PORT = "3306"
    DB_USERNAME = "root"
    DB_DATABASE = var.mysql_database
    MONGO_URI = var.mongo_uri
  }
}

# Secret
resource "kubernetes_secret" "app_secrets" {
  metadata {
    name = "app-secrets"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
  }

  data = {
    DB_PASSWORD = base64encode(var.mysql_root_password)
    JWT_SECRET = base64encode(var.jwt_secret)
  }

  type = "Opaque"
}

# App Deployment
resource "kubernetes_deployment" "app" {
  metadata {
    name = "app-deployment"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
    labels = { app = "tech-challenge-fiap" }
  }

  spec {
    replicas = var.app_replicas

    selector {
      match_labels = { app = "tech-challenge-fiap" }
    }

    template {
      metadata {
        labels = { app = "tech-challenge-fiap" }
      }

      spec {
        container {
          name = "app"
          image = var.app_image
          image_pull_policy = "Never"
          port {
            container_port = 3000
          }

          # ConfigMap
          env_from {
            config_map_ref {
              name = kubernetes_config_map.app_config.metadata[0].name
            }
          }

          # Secret
          env_from {
            secret_ref {
              name = kubernetes_secret.app_secrets.metadata[0].name
            }
          }
        }
      }
    }
  }
}

# App Service
resource "kubernetes_service" "app" {
  metadata {
    name = "app-service"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
  }

  spec {
    selector = { app = "tech-challenge-fiap" }
    port {
      port = 3000
      target_port = 3000
    }
    type = "ClusterIP"
  }
}

# MySQL PersistentVolumeClaim
resource "kubernetes_persistent_volume_claim" "mysql_pvc" {
  metadata {
    name = "mysql-pvc"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = { storage = "1Gi" }
    }
  }
}

# MySQL Deployment
resource "kubernetes_deployment" "mysql" {
  metadata {
    name = "mysql-deployment"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
    labels = { app = "mysql" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "mysql" }
    }

    template {
      metadata {
        labels = { app = "mysql" }
      }

      spec {
        container {
          name = "mysql"
          image = "mysql:8.0"
          port {
            container_port = 3306
          }

          env {
            name = "MYSQL_ROOT_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app_secrets.metadata[0].name
                key  = "DB_PASSWORD"
              }
            }
          }
          env {
            name = "MYSQL_DATABASE"
            value = var.mysql_database
          }

          volume_mount {
            name = "mysql-pvc"
            mount_path = "/var/lib/mysql"
          }
        }

        volume {
          name = "mysql-pvc"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mysql_pvc.metadata[0].name
          }
        }
      }
    }
  }
}

# MySQL Service
resource "kubernetes_service" "mysql" {
  metadata {
    name = "mysql-service"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
  }

  spec {
    selector = { app = "mysql" }
    port {
      port = 3306
      target_port = 3306
    }
    type = "ClusterIP"
  }
}

# MongoDB PersistentVolumeClaim
resource "kubernetes_persistent_volume_claim" "mongo_pvc" {
  metadata {
    name = "mongo-pvc"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = { storage = "1Gi" }
    }
  }
}

# MongoDB Deployment
resource "kubernetes_deployment" "mongo" {
  metadata {
    name = "mongo-deployment"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
    labels = { app = "mongodb" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "mongodb" }
    }

    template {
      metadata {
        labels = { app = "mongodb" }
      }

      spec {
        container {
          name  = "mongodb"
          image = "mongo:5"
          port {
            container_port = 27017
          }

          volume_mount {
            name = "mongo-pvc"
            mount_path = "/data/db"
          }
        }

        volume {
          name = "mongo-pvc"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mongo_pvc.metadata[0].name
          }
        }
      }
    }
  }
}

# MongoDB Service
resource "kubernetes_service" "mongo" {
  metadata {
    name = "mongo-service"
    namespace = kubernetes_namespace.tech_challenge.metadata[0].name
  }

  spec {
    selector = { app = "mongodb" }
    port {
      port = 27017
      target_port = 27017
    }
    type = "ClusterIP"
  }
}