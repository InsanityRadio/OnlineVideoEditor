#!/bin/sh

# Is PULL_URL empty? If so, expect someone to push video to me instead
if [ -z "$PULL_URL" ]; then
    sed "/<rtmp_url>/d" /etc/nginx/nginx.conf.e > /tmp/nginx.conf.e
    sed "s/deny publish/allow publish/" /tmp/nginx.conf.e > /tmp/nginx.conf
else
    sed "s#<rtmp_url>#${PULL_URL}#" /etc/nginx/nginx.conf.e > /tmp/nginx.conf
fi
nginx -g "daemon off;" -c /tmp/nginx.conf
