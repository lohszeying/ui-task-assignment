# React + TypeScript + Vite

## Running with Docker

You can work with this Vite app without installing Node.js or npm locally.

### Development server

Build the dev image once:

```bash
docker compose build
```

Start the hot-reloading dev server:

```bash
docker compose up
```

The Vite server runs on port `5173`. Your local files are mounted into the container, and dependencies are isolated in an internal `node_modules` volume.

### Production preview

Build the production image:

```bash
docker build -t ui-task-app .
```

Run the optimized bundle (served by Nginx):

```bash
docker run --rm -p 8080:80 ui-task-app
```

The production container serves the compiled assets on port `8080`.