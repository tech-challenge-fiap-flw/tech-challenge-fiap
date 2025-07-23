#!/bin/sh
set -e

host="$1"
shift
cmd="$@"

echo "Aguardando MySQL em $host:3306..."

until nc -z "$host" 3306; do
  echo "Ainda não disponível, esperando..."
  sleep 2
done

echo "MySQL disponível! Iniciando aplicação..."
exec $cmd
