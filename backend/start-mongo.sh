#!/bin/bash

CONTAINER_NAME="jhon-cortes-mongo"
MONGO_IMAGE="mongo:latest"
MONGO_PORT=27017

# Verifica se o container existe
if [ $(docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME | wc -l) -eq 0 ]; then
    echo "Container $CONTAINER_NAME não existe. Criando..."
    docker run -d --name $CONTAINER_NAME -p $MONGO_PORT:27017 $MONGO_IMAGE
else
    # Verifica se está rodando
    if [ $(docker ps --format '{{.Names}}' | grep -w $CONTAINER_NAME | wc -l) -eq 0 ]; then
        echo "Container $CONTAINER_NAME existe mas está parado. Iniciando..."
        docker start $CONTAINER_NAME
    else
        echo "Container $CONTAINER_NAME já está rodando."
    fi
fi
