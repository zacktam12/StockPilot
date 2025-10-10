# Swagger API Documentation Guide

## What is Swagger?

Swagger (OpenAPI) is a specification for describing REST APIs. It provides:

1. **Interactive API Documentation** - A web interface where developers can explore and test your API endpoints
2. **Standardized API Description** - A machine-readable format that describes your API structure
3. **Code Generation** - Tools can generate client SDKs and server stubs from your API specification
4. **Testing Interface** - Built-in tools to test API endpoints directly from the documentation

## How to Access Your Swagger Documentation

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:5000/api-docs
   ```

## Current Setup

Your backend already has Swagger configured with:

- ✅ Swagger dependencies installed (`swagger-jsdoc` and `swagger-ui-express`)
- ✅ Basic Swagger configuration in `backend/src/docs/swagger.js`
- ✅ Swagger UI accessible at `/api-docs` endpoint
- ✅ Schema definitions for your models
- ✅ Some route documentation already added

## How to Add Swagger Documentation to Routes

### Basic Structure

Add JSDoc comments above your route handlers:

```javascript
/**
 * @swagger
 * /api/endpoint:
 *   method:
 *     summary: Brief description
 *     tags: [TagName]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path/query/header
 *         name: paramName
 *         required: true/false
 *         schema:
 *           type: string/number/integer/boolean
 *         description: Parameter description
 *     requestBody:
 *       required: true/false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *                 description: Field description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModelName'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
```

### Example: Complete Route Documentation

```javascript
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               stock:
 *                 type: integer
 *                 description: Initial stock quantity
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: Category ID
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *                 description: Supplier ID
 *               image:
 *                 type: string
 *                 description: Product image URL
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/", authenticate, authorize("admin"), validateCreateProduct, productController.createProduct);
```

## Available Schema References

Your Swagger configuration includes these schemas:

- `Product` - Product model
- `User` - User model
- `Category` - Category model
- `Sale` - Sale model
- `Purchase` - Purchase model
- `Customer` - Customer model
- `Supplier` - Supplier model
- `ProductSale` - Product sale relationship
- `ProductPurchase` - Product purchase relationship
- `Error` - Error response format
- `Success` - Success response format

## Common Patterns

### 1. Pagination Response
```javascript
responses:
  200:
    description: List with pagination
    content:
      application/json:
        schema:
          type: object
          properties:
            data:
              type: array
              items:
                $ref: '#/components/schemas/ModelName'
            pagination:
              type: object
              properties:
                page:
                  type: integer
                limit:
                  type: integer
                total:
                  type: integer
                pages:
                  type: integer
```

### 2. Query Parameters
```javascript
parameters:
  - in: query
    name: page
    schema:
      type: integer
      default: 1
    description: Page number
  - in: query
    name: search
    schema:
      type: string
    description: Search term
```

### 3. Path Parameters
```javascript
parameters:
  - in: path
    name: id
    required: true
    schema:
      type: string
      format: uuid
    description: Resource ID
```

### 4. File Upload
```javascript
requestBody:
  required: true
  content:
    multipart/form-data:
      schema:
        type: object
        required:
          - file
        properties:
          file:
            type: string
            format: binary
            description: File to upload
```

## Testing Your API

1. **Access Swagger UI**: Go to `http://localhost:5000/api-docs`
2. **Authorize**: Click "Authorize" button and enter your JWT token
3. **Test Endpoints**: Click on any endpoint to expand it
4. **Try it out**: Click "Try it out" button
5. **Fill Parameters**: Enter required parameters and request body
6. **Execute**: Click "Execute" to test the endpoint

## Best Practices

1. **Always include security**: Add `security: - bearerAuth: []` for protected routes
2. **Use descriptive summaries**: Make them clear and concise
3. **Group related endpoints**: Use consistent tags
4. **Document all parameters**: Include descriptions for all parameters
5. **Show all response codes**: Document success and error responses
6. **Use schema references**: Reference existing schemas with `$ref`
7. **Include examples**: Add example values where helpful

## Adding New Schemas

To add new schemas to your Swagger configuration, edit `backend/src/docs/swagger.js`:

```javascript
schemas: {
  NewModel: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      // ... other properties
    },
  },
}
```

## Troubleshooting

1. **Swagger UI not loading**: Check if server is running and accessible at `/api-docs`
2. **Missing documentation**: Ensure JSDoc comments are properly formatted
3. **Schema errors**: Check that referenced schemas exist in the configuration
4. **Authentication issues**: Make sure to authorize in Swagger UI before testing protected endpoints

## Next Steps

1. Add Swagger documentation to all your remaining routes
2. Test all endpoints through the Swagger UI
3. Consider adding more detailed examples
4. Update schemas as your models evolve
5. Share the documentation with your frontend team

Your Swagger documentation will be automatically updated when you restart your server after making changes to the JSDoc comments.
