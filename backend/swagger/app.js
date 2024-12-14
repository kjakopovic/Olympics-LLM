const express = require('express')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const swaggerDefinition = require('./docs.json')

const options = {
  swaggerDefinition,
  apis: []
};
const swaggerSpec = swaggerJSDoc(options);

const port = process.env.PORT || 5050

const app = express()

app.use('/api-docs', swaggerUI.serve,
  swaggerUI.setup(null, options))

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Swagger app listening on port ${port}`)
})