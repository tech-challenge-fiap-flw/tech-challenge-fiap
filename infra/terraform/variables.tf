variable "namespace" {
  description = "Namespace do projeto"
  type        = string
  default     = "tech-challenge-fiap"
}

variable "app_image" {
  description = "Imagem Docker do App"
  type        = string
  default     = "app:latest"
}

variable "app_replicas" {
  description = "Número de réplicas do App"
  type        = number
  default     = 2
}

variable "mysql_root_password" {
  description = "Senha do MySQL"
  type        = string
  default     = "root"
  sensitive   = true
}

variable "mysql_database" {
  description = "Database do MySQL"
  type        = string
  default     = "tech_challenge_fiap"
}

variable "mongo_uri" {
  description = "URI do MongoDB"
  type        = string
  default     = "mongodb://mongodb:27017/tech_challenge_fiap"
}

variable "jwt_secret" {
  description = "JWT Secret"
  type        = string
  default     = "AUTH_JWT_TECH_CHALLENGE_FIAP"
  sensitive   = true
}