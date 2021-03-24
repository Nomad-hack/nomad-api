#!/bin/bash

API="http://localhost:4741"
URL_PATH="/appointments"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
  "appointment": {
    "title": "'"${TITLE}"'",
    "description": "'"${DES}"'",
    "type": "'"${TYPE}"'",
    "instructor": "'"${INST}"'",
    "date": "'"${DATE}"'",
    "duration": "'"${DUR}"'",
    "cost": "'"${COST}"'"
  }
  }'

echo
