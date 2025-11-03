#!/usr/bin/env bash
set -euo pipefail

API=${API:-http://localhost:4000}

echo "Checking health..."
curl -fsS "$API/health" | jq . >/dev/null || true

TRACK_ID=$(curl -fsS "$API/api/tracks" | jq -r '.[0].id')
echo "Using track: $TRACK_ID"

ITEM=$(curl -fsS -X POST "$API/api/playlist" \
  -H 'Content-Type: application/json' \
  -d "{\"track_id\":\"$TRACK_ID\",\"added_by\":\"cli\"}")
ITEM_ID=$(echo "$ITEM" | jq -r .id)
echo "Created playlist item: $ITEM_ID"

curl -fsS -X PATCH "$API/api/playlist/$ITEM_ID" \
  -H 'Content-Type: application/json' \
  -d '{"is_playing":true}' >/dev/null

curl -fsS -X POST "$API/api/playlist/$ITEM_ID/vote" \
  -H 'Content-Type: application/json' \
  -d '{"direction":"up"}' >/dev/null

curl -fsS -X DELETE "$API/api/playlist/$ITEM_ID" >/dev/null

echo "OK"

