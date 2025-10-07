output "namespace" {
  value = kubernetes_namespace.tech_challenge.metadata[0].name
}

output "app_service" {
  value = kubernetes_service.app.metadata[0].name
}

output "mysql_service" {
  value = kubernetes_service.mysql.metadata[0].name
}

output "mongo_service" {
  value = kubernetes_service.mongo.metadata[0].name
}