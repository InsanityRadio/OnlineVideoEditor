#!/bin/sh

# Is PULL_URL empty? If so, expect someone to push video to me instead
sed "s#<ingest>#${INGEST_URL}#" /etc/nginx/nginx.conf.e > /tmp/nginx.conf

nginx -g "daemon off;" -c /tmp/nginx.conf
