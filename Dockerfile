# Install dependencies only when needed
FROM node:18-alpine3.15 AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Build the app with cache dependencies
FROM node:18-alpine3.15 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run the app
FROM node:18-alpine3.15 AS runner

# Set working directory
WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --only=production

COPY --from=builder /app/dist ./dist

# # Copiar el directorio y su contenido si es necesario
# RUN mkdir -p ./pokedex
# COPY --from=builder /app/dist/ ./app
# COPY ./.env ./app/.env

# # Dar permiso para ejecutar la aplicación si es necesario
# RUN adduser --disabled-password pokeuser
# RUN chown -R pokeuser:pokeuser ./pokedex
# USER pokeuser

# EXPOSE 3000

CMD [ "node", "dist/main" ]
