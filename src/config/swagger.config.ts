import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Code Challenge BFF API',
            version: '1.0.0',
            description: 'Backend API with authentication and authorization',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Authentication endpoints'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User ID',
                        },
                        name: {
                            type: 'string',
                            description: 'User name',
                        },
                        email: {
                            type: 'string',
                            description: 'User email',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                        },
                        password: {
                            type: 'string',
                            description: 'User password',
                        },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'User name',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                        },
                        password: {
                            type: 'string',
                            description: 'User password',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        accessToken: {
                            type: 'string',
                            description: 'JWT access token',
                        },
                        refreshToken: {
                            type: 'string',
                            description: 'JWT refresh token',
                        },
                        user: {
                            $ref: '#/components/schemas/User',
                        },
                    },
                },
                RefreshTokenRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: {
                            type: 'string',
                            description: 'JWT refresh token',
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);