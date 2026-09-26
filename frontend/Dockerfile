# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
# Longer timeout keeps installs resilient on slower/home networks.
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY . .
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV DISABLE_EMERGENT_OVERLAY=true
ENV CI=false
RUN yarn build

# ---- serve stage ----
FROM node:20-alpine
WORKDIR /app
RUN yarn global add serve
COPY --from=build /app/build ./build
EXPOSE 3000
# `serve -s` serves the SPA with client-side routing fallback (so /admin works).
CMD ["serve", "-s", "build", "-l", "3000"]
