# AYNAMODA API

A comprehensive REST API for the AYNAMODA fashion and style management platform, built with Go, Gin, and PostgreSQL.

## Features

- **User Management**: Registration, authentication, profile management
- **Style DNA**: Personalized style assessment and recommendations
- **Product Management**: Wardrobe item tracking with categories and images
- **Outfit Creation**: Smart outfit combinations and management
- **Authentication**: JWT-based authentication with refresh tokens
- **File Upload**: Image upload and management
- **Rate Limiting**: API rate limiting and security
- **CORS Support**: Cross-origin resource sharing
- **Health Checks**: System health and readiness endpoints

## Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL with GORM ORM
- **Authentication**: JWT tokens
- **Validation**: Go Playground Validator
- **Configuration**: Environment variables
- **Middleware**: Custom middleware for auth, CORS, logging, rate limiting

## Project Structure

```
api/
├── internal/
│   ├── config/          # Configuration management
│   ├── database/        # Database connection and migrations
│   ├── handlers/        # HTTP request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── repository/      # Data access layer
│   ├── router/          # Route configuration
│   ├── service/         # Business logic layer
│   └── utils/           # Utility functions
├── main.go              # Application entry point
├── go.mod               # Go module dependencies
├── go.sum               # Dependency checksums
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Go 1.21 or higher
- PostgreSQL 13 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AYNAMODA/api
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE aynamoda_db;
   CREATE USER aynamoda_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE aynamoda_db TO aynamoda_user;
   ```

5. **Run the application**
   ```bash
   go run main.go
   ```

The API will be available at `http://localhost:8080`

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

#### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `SERVER_PORT`: Port for the API server (default: 8080)

#### Optional Variables
- `SERVER_ENVIRONMENT`: Environment (development/production)
- `CORS_ALLOWED_ORIGINS`: Allowed origins for CORS
- `RATE_LIMIT_REQUESTS_PER_SECOND`: Rate limiting configuration
- `LOG_LEVEL`: Logging level (debug/info/warn/error)

See `.env.example` for all available configuration options.

## API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Health Endpoints
- `GET /health` - Health check
- `GET /ready` - Readiness check
- `GET /version` - Version information

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### User Endpoints (Protected)
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/change-password` - Change password
- `GET /api/v1/users/style-dna` - Get style DNA
- `POST /api/v1/users/style-dna` - Create style DNA
- `PUT /api/v1/users/style-dna` - Update style DNA

### Product Endpoints (Protected)
- `POST /api/v1/products` - Create product
- `GET /api/v1/products` - Get user products
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/favorites` - Get favorite products
- `POST /api/v1/products/:id/favorite` - Toggle favorite
- `POST /api/v1/products/:id/images` - Add product image

### Category Endpoints
- `GET /api/v1/public/categories` - Get all categories (public)
- `GET /api/v1/public/categories/root` - Get root categories (public)
- `GET /api/v1/public/categories/tree` - Get category tree (public)
- `POST /api/v1/categories` - Create category (protected)
- `PUT /api/v1/categories/:id` - Update category (protected)
- `DELETE /api/v1/categories/:id` - Delete category (protected)

### Outfit Endpoints (Protected)
- `POST /api/v1/outfits` - Create outfit
- `GET /api/v1/outfits` - Get user outfits
- `GET /api/v1/outfits/:id` - Get outfit by ID
- `PUT /api/v1/outfits/:id` - Update outfit
- `DELETE /api/v1/outfits/:id` - Delete outfit
- `GET /api/v1/public/outfits` - Get public outfits
- `POST /api/v1/outfits/:id/products/:productId` - Add product to outfit
- `DELETE /api/v1/outfits/:id/products/:productId` - Remove product from outfit

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Flow
1. Register or login to get access and refresh tokens
2. Use access token for API requests
3. When access token expires, use refresh token to get new tokens
4. Refresh tokens have longer expiry times

## Error Handling

The API returns consistent error responses:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- Global: 100 requests per second
- Per user: 60 requests per minute
- Burst allowance: 200 requests

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Development

### Running in Development Mode
```bash
# Set environment to development
export SERVER_ENVIRONMENT=development

# Run with hot reload (install air first: go install github.com/cosmtrek/air@latest)
air

# Or run normally
go run main.go
```

### Database Migrations

Migrations are automatically run on startup. The application uses GORM's AutoMigrate feature.

### Testing

```bash
# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests with verbose output
go test -v ./...
```

### Building for Production

```bash
# Build binary
go build -o aynamoda-api main.go

# Run binary
./aynamoda-api
```

## Docker Support

Create a `Dockerfile`:

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers
- SQL injection prevention with GORM

## License

This project is licensed under the MIT License.