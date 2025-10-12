# ui-task-assignment

This is the frontend repository for task-assignment.

For backend and design decisions, please visit README under [api-task-assignment](https://github.com/lohszeying/api-task-assignment).

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

