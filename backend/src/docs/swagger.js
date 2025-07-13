// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventory Management System API",
      version: "1.0.0",
      description: "API documentation for the Inventory Management System",
      contact: {
        name: "API Support",
        email: "support@inventory.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "integer" },
            categoryId: { type: "string", format: "uuid" },
            supplierId: { type: "string", format: "uuid" },
            image: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["admin", "staff"] },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Sale: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            customerId: { type: "string", format: "uuid" },
            totalAmount: { type: "number" },
            status: {
              type: "string",
              enum: ["pending", "completed", "cancelled"],
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Purchase: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            supplierId: { type: "string", format: "uuid" },
            totalAmount: { type: "number" },
            status: {
              type: "string",
              enum: ["pending", "received", "cancelled"],
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // path to your route files where Swagger comments exist
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
