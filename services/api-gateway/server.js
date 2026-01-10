const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.use(cors());

// Example proxy setup: forward /api/* to respective services in docker network
app.use('/api/products', createProxyMiddleware({ target: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3001', changeOrigin: true, pathRewrite: {'^/api/products': '/api/products'} }));
app.use('/api/users', createProxyMiddleware({ target: process.env.USER_SERVICE_URL || 'http://user-service:3002', changeOrigin: true, pathRewrite: {'^/api/users': '/api/users'} }));
app.use('/api/cart', createProxyMiddleware({ target: process.env.CART_SERVICE_URL || 'http://cart-service:3004', changeOrigin: true, pathRewrite: {'^/api/cart': '/api/cart'} }));
app.use('/api/orders', createProxyMiddleware({ 
    target: process.env.ORDER_SERVICE_URL || 'http://order-service:3003', 
    changeOrigin: true, 
    pathRewrite: {'^/api/orders': '/api/orders'}, 
    onProxyReq: (proxyReq, req, res) => {
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
    }
}));
app.use('/api/orders/health', createProxyMiddleware({ target: process.env.ORDER_SERVICE_URL || 'http://order-service:3003', changeOrigin: true, pathRewrite: {'^/api/orders/health': '/api/orders/health'} }));
app.use('/api/payments', createProxyMiddleware({ target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005', changeOrigin: true, pathRewrite: {'^/api/payments': '/api/payments'} }));
app.use('/api/my-purchases', createProxyMiddleware({ target: process.env.MY_PURCHASE_SERVICE_URL || 'http://my-purchase-service:3006', changeOrigin: true, pathRewrite: {'^/api/my-purchases': '/'} }));
app.use('/api/vouchers', createProxyMiddleware({ 
    target: process.env.VOUCHER_SERVICE_URL || 'http://voucher-service:3007', 
    changeOrigin: true, 
    pathRewrite: {'^/api/vouchers': '/api/vouchers'},
    onProxyReq: (proxyReq, req, res) => {
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
    }
}));
app.use('/api/coins', createProxyMiddleware({ target: process.env.SHOPHUBCOIN_SERVICE_URL || 'http://shophubcoin-service:3008', changeOrigin: true, pathRewrite: {'^/api/coins': '/'} }));
app.use('/api/users/me/orders', createProxyMiddleware({ target: process.env.USER_SERVICE_URL || 'http://user-service:3002', changeOrigin: true }));


// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API documentation for the E-commerce application',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server base path for APIs'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'price', 'description', 'category', 'stock'],
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID'
            },
            name: {
              type: 'string',
              description: 'Product name'
            },
            price: {
              type: 'number',
              description: 'Product price'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            category: {
              type: 'string',
              description: 'Product category'
            },
            image: {
              type: 'string',
              description: 'Product image URL'
            },
            stock: {
              type: 'number',
              description: 'Available stock quantity'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Order ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string'
                  },
                  quantity: {
                    type: 'number'
                  }
                }
              }
            },
            total: {
              type: 'number',
              description: 'Total order amount'
            },
            status: {
              type: 'string',
              description: 'Order status'
            }
          }
        }
      }
    },
    paths: {
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products',
          description: 'Retrieve a list of all products',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Product'
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Products'],
          summary: 'Create a new product',
          description: 'Add a new product to the database',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Product created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - Invalid product data'
            }
          }
        }
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID',
          description: 'Retrieve a specific product by its ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Product ID'
            }
          ],
          responses: {
            '200': {
              description: 'Product found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            },
            '404': {
              description: 'Product not found'
            }
          }
        },
        put: {
          tags: ['Products'],
          summary: 'Update product',
          description: 'Update an existing product',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Product ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Product updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            },
            '404': {
              description: 'Product not found'
            }
          }
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete product',
          description: 'Delete a product by its ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Product ID'
            }
          ],
          responses: {
            '200': {
              description: 'Product deleted successfully'
            },
            '404': {
              description: 'Product not found'
            }
          }
        }
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Get all users',
          description: 'Retrieve a list of all users',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
          description: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - Invalid user data'
            }
          }
        }
      },
      '/api/orders': {
        get: {
          tags: ['Orders'],
          summary: 'Get all orders',
          description: 'Retrieve a list of all orders',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Order'
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Orders'],
          summary: 'Create a new order',
          description: 'Create a new order',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Order'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Order created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Order'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - Invalid order data'
            }
          }
        }
      },
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          description: 'Check if the API Gateway is running',
          responses: {
            '200': {
              description: 'API Gateway is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        example: 'OK'
                      },
                      message: {
                        type: 'string',
                        example: 'API Gateway is running'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get current user cart',
          responses: {
            '200': { description: 'Cart retrieved' }
          }
        },
        put: {
          tags: ['Cart'],
          summary: 'Replace entire cart',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array' } } } } }
          },
          responses: { '200': { description: 'Cart replaced' } }
        },
        delete: {
          tags: ['Cart'],
          summary: 'Clear cart',
          responses: { '200': { description: 'Cart cleared' } }
        }
      },
      '/api/cart/items': {
        post: {
          tags: ['Cart'],
          summary: 'Add item to cart',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'integer' } }, required: ['productId'] } } }
          },
          responses: { '201-': { description: 'Item added' } }
        }
      },
      '/api/cart/items/{productId}': {
        patch: {
          tags: ['Cart'],
          summary: 'Update item quantity',
          parameters: [ { name: 'productId', in: 'path', required: true, schema: { type: 'string' } } ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { quantity: { type: 'integer' } }, required: ['quantity'] } } }
          },
          responses: { '200': { description: 'Item updated' } }
        },
        delete: {
          tags: ['Cart'],
          summary: 'Remove item',
          parameters: [ { name: 'productId', in: 'path', required: true, schema: { type: 'string' } } ],
          responses: { '200': { description: 'Item removed' } }
        }
      },
      '/api/payments/create-payment-intent': {
        post: {
          tags: ['Payments'],
          summary: 'Create payment intent',
          description: 'Create a Stripe payment intent for processing payments',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['amount'],
                  properties: {
                    amount: {
                      type: 'number',
                      description: 'Payment amount in cents',
                      example: 1000
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Payment intent created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      clientSecret: {
                        type: 'string',
                        description: 'Stripe client secret for the payment intent'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - Invalid amount'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      }
    }
  },
  apis: [] // We're defining the API inline, so no external files needed
};

const specs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-commerce API Documentation'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Gateway is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});