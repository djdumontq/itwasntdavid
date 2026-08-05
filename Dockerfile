FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set up working directory
WORKDIR /app

# Ensure correct permissions for workdir
RUN chown -R node:node /app

# Run as node user (UID/GID 1000) to match host user permissions
USER node

# Copy package and lock files
COPY --chown=node:node package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install dependencies using pnpm
RUN pnpm install

# Copy application files
COPY --chown=node:node . .

# Expose Vite dev port (5176) and TinaCMS GraphQL port (4004)
EXPOSE 5176
EXPOSE 4004

CMD ["pnpm", "dev"]
