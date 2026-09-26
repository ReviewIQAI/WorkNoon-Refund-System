# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV DISABLE_EMERGENT_OVERLAY=true
RUN yarn build

# ---- serve stage ----
FROM node:20-alpine
WORKDIR /app
RUN yarn global add serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
