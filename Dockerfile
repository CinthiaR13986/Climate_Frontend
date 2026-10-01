# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:24.21.0-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1
FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm --mount=type=secret,id=npm_ca \
    if [ -f /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; npm ci
COPY angular.json tsconfig.json tsconfig.app.json .postcssrc.json ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production PORT=4200
WORKDIR /app
COPY --from=build --chown=node:node /app/dist/climate-monitoring-web/browser ./browser
COPY --chown=node:node server.mjs ./server.mjs
USER node
EXPOSE 4200
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:4200/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
