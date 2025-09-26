# Code Challenge BFF - Computer Store Checkout System

A complete backend service for a computer store checkout system built with Node.js, Express, TypeScript, and MongoDB. Features authentication, order management, flexible pricing rules, and comprehensive API documentation.

## Features

- 🛒 **Checkout System**
  - Flexible pricing rules engine
  - Product catalog management
  - Order processing with total calculation
  - Support for bulk discounts and promotional offers

- 🔐 **Authentication & Authorization**
  - JWT-based authentication with access/refresh tokens
  - User registration and login
  - Protected routes with middleware
  - Secure password hashing with crypto

- 📊 **Order Management**
  - Create, read, and delete orders
  - User-specific order isolation
  - Complete order lifecycle tracking

- 📚 **API Documentation**
  - Interactive Swagger UI
  - Comprehensive endpoint documentation
  - Request/response schemas

- 🛠️ **Technical Stack**
  - Node.js with Express
  - TypeScript for type safety
  - MongoDB with Mongoose ODM
  - Zod for schema validation
  - Jest for testing

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yusufjameel1/code-challenge-bff.git
   cd code-challenge-bff
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/code-challenge-bff
   JWT_ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
   JWT_REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
   ```

4. **Start MongoDB:**
   Ensure MongoDB is running locally or update `MONGODB_URI` for remote connection.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `npm run dev` | Start development server with hot reload |
| **Production** | `npm run build` | Build TypeScript to JavaScript |
| | `npm start` | Start production server |
| **Testing** | `npm test` | Run all tests |
| | `npm run test:watch` | Run tests in watch mode |
| | `npm run test:coverage` | Run tests with coverage report |
| **Code Quality** | `npm run lint` | Run ESLint |
| | `npm run lint:fix` | Fix ESLint errors automatically |
| **Git Hooks** | `npm run prepare` | Initialize husky git hooks |

## Quick Start

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Access Swagger UI:**
   Open http://localhost:3000/api-docs in your browser

3. **Register a user:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
   ```

4. **Login and get token:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"password123"}'
   ```

5. **Create an order:**
   ```bash
   curl -X POST http://localhost:3000/api/orders \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"customerName":"John Doe","items":["ipd","atv","vga"]}'
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout (protected)

### Orders
- `GET /api/orders` - Get user orders (protected)
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders/:id` - Get specific order (protected)
- `DELETE /api/orders/:id` - Delete order (protected)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (protected)
- `GET /api/products/:sku` - Get product by SKU
- `PUT /api/products/:sku` - Update product (protected)
- `DELETE /api/products/:sku` - Delete product (protected)

### Pricing Rules
- `GET /api/pricing-rules` - Get all pricing rules
- `POST /api/pricing-rules` - Create pricing rule (protected)
- `GET /api/pricing-rules/:id` - Get specific pricing rule
- `PUT /api/pricing-rules/:id` - Update pricing rule (protected)
- `DELETE /api/pricing-rules/:id` - Delete pricing rule (protected)

## Swagger UI

Access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

The Swagger UI provides:
- Complete API endpoint documentation
- Interactive request/response testing
- Schema definitions
- Authentication flow examples

## Product Catalog

| SKU | Name         | Price    |
|-----|--------------|----------|
| ipd | Super iPad   | $549.99  |
| mbp | MacBook Pro  | $1399.99 |
| atv | Apple TV     | $109.50  |
| vga | VGA adapter  | $30.00   |

## Pricing Rules

The system supports flexible pricing rules:

1. **3 for 2 Deal on Apple TVs**
   - Buy 3 Apple TVs, pay for 2 only
   - Example: 3 × $109.50 = $219.00 (instead of $328.50)

2. **Bulk Discount on Super iPads**
   - Price drops to $499.99 each when buying more than 4
   - Example: 5 × $499.99 = $2499.95 (instead of $2749.95)

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- Authentication flows
- Order management
- Pricing rule calculations
- API endpoint validation
- Error handling

## Project Structure

```
src/
├── config/          # Configuration files (JWT, Swagger)
├── controllers/     # Route controllers
├── data/           # Static data (products, pricing rules)
├── middleware/     # Custom middleware (auth, validation)
├── models/         # Mongoose models
├── routes/         # Route definitions
├── schemas/        # Zod validation schemas
├── services/       # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions (checkout, auth, logger)
├── app.ts          # Express application setup
└── server.ts       # Server entry point
```

## Security Features

- Password hashing with crypto
- JWT token-based authentication
- HTTP security headers with Helmet
- CORS enabled for cross-origin requests
- Input validation with Zod schemas
- Protected routes with authentication middleware

## Development

1. **Code Style:**
   - ESLint for code linting
   - Prettier for code formatting
   - TypeScript for type safety
   - Pre-commit hooks with Husky to lint code before commits

2. **Database:**
   - MongoDB with Mongoose ODM
   - Automatic data seeding on startup
   - Test database isolation

3. **Error Handling:**
   - Centralized error handling
   - Structured logging
   - Validation error responses

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

ISC