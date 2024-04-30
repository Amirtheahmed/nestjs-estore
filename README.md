# NestJS E-Store API

## Description

This is a RESTful API designed for an online store to manage products, categories, and user interactions. Developed using NestJS, this API supports functionalities such as adding, deleting, editing, and searching for products. It is intended for use by mobile developers to connect with a mobile app frontend.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Prisma**: Next-generation ORM for Node.js and TypeScript for database management.
- **Passport**: Authentication middleware for Node.js, implementing JWT for secure access.
- **Swagger**: API documentation generator for RESTful web services.
- **Docker**: Platform for developing, shipping, and running applications inside containers.
- **GitHub Actions**: CI/CD for automation of builds, tests, and deployment.
- **Other technologies**: Cache management, rate limiting, data seeding, security headers with Helmet.js, and compression with Gzip.

## Features

- CRUD operations for products and categories.
- Nested set model for category management.
- User registration and authentication.
- Role-Based Access Control (RBAC) for different user roles.
- Pagination and search functionality for users, products and categories.
- Dynamic Api response caching with invalidation
- Gzip compression to optimize performance since API will be primarily consumed by mobile apps.
- Automated tests (e2e) using jest and pactum.
- Security headers via Helmet.js.
- Rate limiting
- Seeder for user, products and categories.
- API documentation using Swagger.
- Dockerized environment setup.
- Continuous Integration and Deployment using GitHub Actions to deploy to private server.

## Installation

### Prerequisites

- Node.js 16+
- Docker
- A preferred text editor and terminal.

### Setting Up

Clone the repository to your local machine:

```bash
git clone https://github.com/Amirtheahmed/nestjs-estore.git
cd nestjs-estore
```

Install dependencies:

```bash
npm install
```

Start the Docker environment for development:

```bash
npm run db:dev:restart
```

### Running the Application locally

To run the application in development mode:

```bash
npm run start:dev
```

To seed db with data run

```bash
npm prisma db seed
```

## Usage

After running the application, you can access the API 

- Direct API at http://localhost:3000/api

### API Documentation

Access the auto-generated Swagger documentation at http://localhost:3000/api.

### Running Tests

To execute end-to-end tests:

```bash
npm run test:e2e
```

### Docker Commands

Helpful Docker commands for managing the development and test databases:

```bash
npm run db:dev:restart  # Restart development database
```

Take look inside `package.json` for more commands
