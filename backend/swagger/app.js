const express = require('express')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
// const swaggerDefinition = require('./openapi.yaml')
const yaml = require('js-yaml');
const fs = require('fs');

const swaggerDefinition = yaml.load(fs.readFileSync('./openapi.yaml', 'utf8'));

const options = {
  swaggerDefinition,
  apis: []
};
const swaggerSpec = swaggerJSDoc(options);

const port = process.env.PORT || 5050

const app = express()

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Swagger app listening on port ${port}`)
})