# Microservices Deployment Guide

This guide will walk you through the steps to deploy the microservices project using Docker Compose. The project consists of multiple services, each with its own PostgreSQL database.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Node.js** (optional, for local development): [Install Node.js](https://nodejs.org/)
- **Postman** (optional, for API testing): [Download Postman](https://www.postman.com/downloads/)

---

## Step 1: Set Up the `.env` File

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and update the environment variables as needed. Here’s an example:

   ```bash
   # .env
   TENANT_ID=47dd6b24-0b23-46b0-a662-776158d089ba
   JWT_SECRET=auth_ms_jwt_secret
   ADMIN_TENANT_ID=47dd6b24-0b23-46b0-a662-776158d089ba
   ADMIN_JWT_SECRET=admin_auth_ms_jwt_secret
   ```

   Replace the values with your own if necessary.

---

## Step 2: Run Docker Compose

1. Navigate to the root directory of the project (where the `docker-compose.yml` file is located).

2. Start the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build the Docker images for all services.
   - Start the PostgreSQL databases and wait for them to be ready.
   - Run database migrations for each service.
   - Start the microservices.

3. Verify that all services are running:
   - Check the logs to ensure there are no errors:
     ```bash
     docker-compose logs -f
     ```
   - You should see messages like:
     ```
     auth-service    | Running database migrations...
     auth-service    | Starting the application...
     auth-service    | Server running on port 8000
     ```

---

## Step 3: Access the Services

Once the services are running, you can access them at the following ports:

| Service          | Port  | Description                     |
|------------------|-------|---------------------------------|
| **auth-service** | 8001  | Authentication service          |
| **orders-service** | 8002  | Orders service                 |
| **product-service** | 8003 | Product service                |
| **tenant-service** | 8004  | Tenant service                 |
| **wishlist-service** | 8005 | Wishlist service              |

For example, to access the `auth-service`, open your browser or use `curl`:
```bash
curl http://localhost:8001
```

---

## Step 4: API Testing with Postman

To test the APIs, you can use the provided Postman collection. The collection is already configured with the correct URLs, so no additional setup is required.

### Steps to Use the Postman Collection

1. **Download the Postman Collection**:
   - The Postman collection JSON file is included in the project. You can find it the root project:
     ```
     postman_collection.json
     ```

2. **Import the Collection into Postman**:
   - Open Postman.
   - Click on **File > Import**.
   - Select the `postman_collection.json` file.

3. **Set Up Environment Variables in Postman**:
   - The collection uses environment variables like `{{API_AUTH}}`, `{{API_PRODUCT}}`, etc., which are already set to the correct URLs (e.g., `http://localhost:8001` for `auth-service`).
   - No additional configuration is needed.

4. **Run the API Tests**:
   - Use the imported collection to test the APIs.
   - For example, to test the `auth-service`, select the **Auth > Login Admin** request and click **Send**.

5. **Save the JWT Token**:
   - After logging in, the JWT token is automatically saved as a collection variable (`{{token}}`) and used for authenticated requests.

---

## Step 5: Stop the Services

To stop the services, press `Ctrl+C` in the terminal where Docker Compose is running. Alternatively, you can stop the services using:
```bash
docker-compose down
```

To remove all volumes (including database data), use:
```bash
docker-compose down -v
```

---

## Step 6: Troubleshooting

### Common Issues

1. **Migrations Fail**:
   - Ensure the PostgreSQL databases are fully initialized before running migrations.
   - Check the logs for errors:
     ```bash
     docker-compose logs <service-name>
     ```

2. **Connection Refused**:
   - Verify that the database containers are running:
     ```bash
     docker-compose ps
     ```
   - Ensure the `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` environment variables are correctly set in the `.env` file.

3. **Port Conflicts**:
   - If a port is already in use, update the `ports` configuration in `docker-compose.yml`.

---

## Step 7: Development Workflow

### Running Services Locally

1. Install dependencies for each service:
   ```bash
   cd <service-directory>
   pnpm install
   ```

2. Start the service in development mode:
   ```bash
   pnpm run dev
   ```

3. Repeat for other services as needed.

### Running Migrations Locally

To run migrations locally, ensure the database is running and update the `.env` file with the correct database connection details. Then run:
```bash
pnpm run migrate
```

---


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
