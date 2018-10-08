#!/bin/sh

sed "s#<rtmp_url>#${PULL_URL}#" /etc/nginx/nginx.conf.e > /tmp/nginx.conf
nginx -g "daemon off;" -c /tmp/nginx.conf
