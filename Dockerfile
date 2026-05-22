# use the official Bun image
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY packages/db/package.json /temp/dev/packages/db/
COPY apps/api/package.json /temp/dev/apps/api/
COPY apps/web/package.json /temp/dev/apps/web/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY packages/db/package.json /temp/prod/packages/db/
COPY apps/api/package.json /temp/prod/apps/api/
COPY apps/web/package.json /temp/prod/apps/web/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun run build
RUN bun run check

# copy production dependencies and source code into final image
FROM base
WORKDIR /usr/src/app
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=release /usr/src/app/ .

ENV NODE_ENV=production

# run the app
USER bun
EXPOSE 3000/tcp
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun --eval "const r=await fetch('http://localhost:3000/api/health');process.exit(r.ok?0:1)" || exit 1
ENTRYPOINT [ "bun", "run", "start" ]
