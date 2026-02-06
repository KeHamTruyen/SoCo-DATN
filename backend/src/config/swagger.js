import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Commerce API',
      version: '1.0.0',
      description: 'API documentation for Social Commerce Platform - Mạng xã hội kết hợp thương mại điện tử',
      contact: {
        name: 'API Support',
        email: 'support@socialcommerce.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.socialcommerce.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token in HTTP-only cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx123abc' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
            fullName: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', nullable: true, example: '0123456789' },
            avatar: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
            coverImage: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['BUYER', 'SELLER', 'ADMIN'], example: 'BUYER' },
            isActive: { type: 'boolean', example: true },
            isVerified: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            _count: {
              type: 'object',
              properties: {
                followers: { type: 'integer', example: 0 },
                following: { type: 'integer', example: 0 },
                products: { type: 'integer', example: 0 },
                posts: { type: 'integer', example: 0 }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  msg: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints (Đăng nhập, đăng ký, xác thực)'
      },
      {
        name: 'Users',
        description: 'User management endpoints (Quản lý người dùng)'
      },
      {
        name: 'Products',
        description: 'Product management endpoints (Quản lý sản phẩm)'
      },
      {
        name: 'Orders',
        description: 'Order management endpoints (Quản lý đơn hàng)'
      },
      {
        name: 'Posts',
        description: 'Social posts endpoints (Quản lý bài viết)'
      },
      {
        name: 'Messages',
        description: 'Messaging endpoints (Quản lý tin nhắn)'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'] // Path to API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
