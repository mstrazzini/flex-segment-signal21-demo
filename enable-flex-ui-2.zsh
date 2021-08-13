#!/bin/zsh

curl --request POST \
 --url https://flex-api.twilio.com/v1/Configuration \
 -u ACf2ffe2c0dad365efd913da831b9a6117:$TWILIO_AUTH_TOKEN \
 --header 'accountsid: ACf2ffe2c0dad365efd913da831b9a6117' \
 --header 'content-type: application/json' \
 --header 'i-twilio-auth-account: ACf2ffe2c0dad365efd913da831b9a6117' \
 --data '{
   "account_sid": "ACf2ffe2c0dad365efd913da831b9a6117",
   "ui_version": "2.0.0-alpha.8",
   "ui_dependencies": {}
}'

