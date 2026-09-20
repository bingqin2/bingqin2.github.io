# The same static files that GitHub Pages serves, packaged for any container
# runtime. nginx-unprivileged runs as UID 101 and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.31-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
