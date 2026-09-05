FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Vite bakes VITE_* vars into the bundle at build time, not runtime —
# these must be build args, not just compose `environment:` entries.
ARG VITE_API_BASE_URL
ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
