const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
app.use(cors());

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
        url: 'http://localhost:3000',
        description: 'Development server'
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

// Proxy middleware
app.use('/api/products', createProxyMiddleware({ 
  target: 'http://product-service:3001', 
  changeOrigin: true 
}));

app.use('/api/users', createProxyMiddleware({ 
  target: 'http://user-service:3002', 
  changeOrigin: true 
}));

app.use('/api/orders', createProxyMiddleware({ 
  target: 'http://order-service:3003', 
  changeOrigin: true 
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Gateway is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});