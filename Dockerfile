# Install dependencies and build the app
FROM node:18.20.2 AS builder
COPY . /app
WORKDIR /app
RUN npm i
RUN npx next build

# Production image
FROM node:18.20.2-alpine as runner
ENV NODE_ENV=production
WORKDIR /app
RUN chown -R node:node /app
USER node
COPY --chown=node:node --from=builder /app/node_modules /app/node_modules
COPY --chown=node:node --from=builder /app/.next /app/.next
COPY --chown=node:node --from=builder /app/public /app/public
COPY --chown=node:node --from=builder /app/next.config.js /app/
COPY --chown=node:node --from=builder /app/package.json /app/
EXPOSE 3000
CMD npx next start