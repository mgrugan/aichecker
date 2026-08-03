# Stage 1: build the frontend
FROM node:22-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY src ./src
RUN npm run build

# Stage 2: serve API + static site with Python
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements-serve.txt ./
RUN pip install --no-cache-dir -r requirements-serve.txt
COPY backend ./backend
COPY --from=frontend /build/dist ./dist
WORKDIR /app/backend
ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
