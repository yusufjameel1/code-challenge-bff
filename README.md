# Code Challenge BFF - Computer Store Checkout System

A backend service built with Node.js, Express, TypeScript, and MongoDB, featuring authentication, authorization, and API documentation.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Access token (1-hour expiry)
  - Refresh token mechanism
  - Protected routes using JWT middleware

- 📚 **API Documentation**
  - Swagger UI integration
  - Interactive API testing interface
  - Detailed request/response schemas

- 🛠️ **Technical Stack**
  - Node.js with Express
  - TypeScript
  - MongoDB with Mongoose
  - JWT for authentication
  - Swagger for API documentation

- 🔒 **Security Features**
  - Password hashing with bcrypt
  - JWT token-based authentication
  - Helmet for HTTP headers security
  - CORS enabled

## Prerequisites

- Node.js (v18 or higher)
- MongoDB installed and running locally
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yusufjameel1/code-challenge-bff.git
   cd code-challenge-bff
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/code-challenge-bff
   JWT_ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
   JWT_REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for hot reloading.

### Production Build
```bash
npm run build
npm start
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

### Available Endpoints

#### Authentication
- POST `/api/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "your-password"
  }
  ```

- POST `/api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "your-password"
  }
  ```

- POST `/api/auth/refresh-token` - Refresh access token
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

- POST `/api/auth/logout` - Logout user (Protected route)
  ```
  Header: Authorization: Bearer <access-token>
  ```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # Route definitions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── app.ts         # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens with short expiry for access tokens
- Protected routes using JWT middleware
- HTTP security headers with Helmet
- CORS enabled for cross-origin requests

## Future Enhancements

- [ ] Add product catalog management
- [ ] Implement checkout system
- [ ] Add order management
- [ ] Implement inventory tracking
- [ ] Add payment integration
- [ ] Implement cart functionality

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

ISC


| SKU     | Name        | Price    |
| --------|:-----------:| --------:|
| ipd     | Super iPad  | $549.99  |
| mbp     | MacBook Pro | $1399.99 |
| atv     | Apple TV    | $109.50  |
| vga     | VGA adapter | $30.00   |

As we're launching our new computer store, we would like to have a few opening day specials.

- we're going to have a 3 for 2 deal on Apple TVs. For example, if you buy 3 Apple TVs, you will pay the price of 2 only
- the brand new Super iPad will have a bulk discounted applied, where the price will drop to $499.99 each, if someone buys more than 4

As our Sales manager is quite indecisive, we want the pricing rules to be as flexible as possible as they can change in the future with little notice.

Our checkout system can scan items in any order.

The interface to our checkout looks like this (shown in typescript):

```typescript
  const co = new Checkout(pricingRules);
  co.scan(item1);
  co.scan(item2);
  co.total();
```

Your task is to implement a checkout system that fulfils the requirements described above.

Example scenarios
-----------------

SKUs Scanned: atv, atv, atv, vga
Total expected: $249.00

SKUs Scanned: atv, ipd, ipd, atv, ipd, ipd, ipd
Total expected: $2718.95

Notes on implementation:

- use **Typescript**
- don't build guis etc, we're more interested in your approach to solving the given task, not how shiny it looks
- don't worry about making a command line interface to the application
- don't use any frameworks
- do include unit tests

When you've finished, send through the link to your github-repo.
