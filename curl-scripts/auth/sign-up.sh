#!/bin/bash

API="http://localhost:4741"
URL_PATH="/sign-up"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --data '{
    "credentials": {
      "email": "'"${EMAIL}"'",
      "username": "'"${UN}"'",
      "age": "'"${AGE}"'",
      "gender": "'"${GEN}"'",
      "role": "'"${ROLE}"'",
      "password": "'"${PWD}"'",
      "password_confirmation": "'"${PWD}"'"
    }
  }'

echo
