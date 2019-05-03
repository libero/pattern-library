#!/bin/bash
set -e

docker-compose --file docker-compose.yml --file docker-compose.ci.yml build &
sleep 10
echo "Monitoring build..."
#$while [ $(docker ps -q | wc -l) -eq 0 ]; do
while true; do
    ps faxww
    top -b -n 1 | head -n 20
    free -m
    sleep 10
    echo "---------------------"
done
echo "Build finished"
