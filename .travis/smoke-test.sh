#!/bin/bash
set -e

function finish {
    docker-compose --file docker-compose.yml --file docker-compose.ci.yml logs
    docker-compose --file docker-compose.yml --file docker-compose.ci.yml down --volumes
}

trap finish EXIT

docker-compose --file docker-compose.yml --file docker-compose.ci.yml up -d

http_code=$(curl -sS http://localhost:8889/ -o /dev/null -w '%{http_code}' 2>&1)
[[ "$http_code" == "200" ]]
