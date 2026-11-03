# Equipment Rental System API

A RESTful backend API for managing equipment and rental requests. It supports user authentication, role-based access control, equipment administration, and member rental requests.

## Features

### Authentication and Users

- Register and log in with email and password
- Password hashing with bcryptjs
- JWT bearer-token authentication via the Authorization header only; login still sets an HTTP-only cookie, which is not used for authentication
- Roles: `admin` and `member`
- Protected routes and role-based authorization
- Registration accepts either role, following PJ01-SportFacility
- Logout clears the cookie; clients must also discard their bearer token, which remains valid until expiration

### Equipment

- Public equipment listing and detail endpoints
- Admin-only create, update, and delete operations
- Equipment data includes name, category, description, available quantity, rental rate per item per day, and active status
- Names are unique; available quantity is a nonnegative integer and rental rate is nonnegative
- Equipment deletion is a soft delete; existing rental history remains available

### Rental Requests

- Members can create rental requests for active equipment
- Members can view, update, and delete their own requests
- Admins can view, update, and delete any request
- Requests include equipment, quantity, start date, return date, and user references
- The authenticated member becomes the owner; updates cannot change ownership
- Creating, updating, or deleting a request does not change equipment quantity
- Each request is checked against the current available quantity independently; requests do not reserve inventory

### Rental Rules

- Start dates cannot be in the past; today is determined using UTC, as in PJ01
- Dates must be real calendar dates in `YYYY-MM-DD` format
- Return dates cannot precede start dates; same-day rentals are allowed
- Quantity must be an integer from 1 to 3 and cannot exceed the available equipment quantity
- Rental duration is `returnDate - startDate`, with a maximum of 7 days; December 1 to December 8 is allowed
- Create and update requests enforce the same rules; omitted update fields retain their current values
- There is no approval, stock deduction, return processing, or overlap restriction in this project specification

### Security and Documentation

- Helmet security headers
- CORS support
- Request rate limiting: 100 requests per IP per 10 minutes
- HTTP parameter pollution protection
- Swagger/OpenAPI documentation at `/api-docs`
- Health check at `/health` (application status only; does not check database connectivity)

## Technology Stack

- Node.js and Express.js
- MongoDB with Mongoose ODM
- JWT and bcryptjs
- Swagger UI and OpenAPI
- Nodemon for development

Dependency ranges and locked dependency versions match PJ01-SportFacility. This project uses the same CommonJS modules, controllers, authentication middleware, and Mongoose approach.

## Project Structure

```text
config/          Environment and database configuration
controllers/     Request handlers
middleware/      Authentication and authorization middleware
models/          Mongoose schemas
routes/          Express API routes and Swagger documentation
server.js        Application entry point
```

## Setup

1. From `PJ02-EquipmentRent`, install dependencies:

   ```bash
   npm ci
   ```

2. Set `MONGO_URI` in `config/config.env` to your MongoDB connection string. It is intentionally blank initially. Set your own `JWT_SECRET` before deploying; the provided value is generated for local development.

   ```dotenv
   NODE_ENV=development
   PORT=5000
   MONGO_URI=
   JWT_SECRET=<your-secret>
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   FRONTEND_URL=http://localhost:3000
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The API runs on `http://localhost:5000` by default. Use a different `PORT` if PJ01 is running on port 5000. With `MONGO_URI` blank, the server exposes the welcome page, Swagger UI, and health endpoint; database-backed APIs require a configured database.

## API Routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/logout`
- `GET /api/v1/equipment`
- `GET /api/v1/equipment/:id`
- `POST /api/v1/equipment` (admin)
- `PUT /api/v1/equipment/:id` (admin)
- `DELETE /api/v1/equipment/:id` (admin)
- `GET /api/v1/rentals` (member or admin)
- `GET /api/v1/rentals/:id` (owner or admin)
- `POST /api/v1/rentals` (member)
- `PUT /api/v1/rentals/:id` (owner or admin)
- `DELETE /api/v1/rentals/:id` (owner or admin)

Successful responses use `{ success: true, data }`, with `count` for lists. Registration and login return the JWT in `data.token`. Errors use `{ success: false, error }`. As in PJ01, unhandled database validation/cast errors reach the global error handler and default to HTTP 500; explicit rental rule failures return HTTP 400.

### Equipment Request Example

```json
{
  "name": "Camera A",
  "category": "Camera",
  "description": "Mirrorless camera with a standard lens",
  "quantity": 5,
  "rentalRate": 200
}
```

### Rental Request Example

```json
{
  "equipment": "<equipment MongoDB ID>",
  "quantity": 2,
  "startDate": "2026-12-01",
  "returnDate": "2026-12-08"
}
```

Use dates that are today or later when trying this example. The equipment ID comes from the equipment response's `_id`.

Send `Authorization: Bearer <JWT>` with protected requests. In Swagger, click **Authorize** and paste `data.token` without the `Bearer ` prefix.

## Checks

```bash
npm test
```

`npm test` performs the same entry-point syntax check as PJ01.

