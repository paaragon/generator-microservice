const openapiParser = require('./app/openapi/parser');

(async () => {
    const api = await openapiParser.parse('./example/swagger.yml');
    console.log(api);
})();