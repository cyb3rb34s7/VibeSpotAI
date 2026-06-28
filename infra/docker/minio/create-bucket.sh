#!/usr/bin/env sh
set -eu

mc alias set local http://minio:9000 vibespot vibespot-local-secret
mc mb --ignore-existing local/vibespot-local
