#!/bin/bash
set -e

docker-compose --file docker-compose.yml --file docker-compose.ci.yml build &
sleep 10
echo "Monitoring build..."
#$while [ $(docker ps -q | wc -l) -eq 0 ]; do
while true; do
    ps faxww
    sleep 10
done
echo "Build finished"
