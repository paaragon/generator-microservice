function parseRequest(methodInfo) {
    const ret = {
        body: getBodyRequest(params),
        path: null,
        query: null,
        header: null
    }

    return ret;
}

function getBodyRequest(params) {
    const bodyParams = params.filter(p => p.in === 'body');
    if (bodyParams.length === 0) {
        return null;
    }

    const schema = bodyParams.schema;
    const parsedSchema = parseSchema(schema);

    if (bodyParams.name === 'body') {
        return parsedSchema;
    }

    return { [bodyParams.name]: parsedSchema };
}

function parseSchema(schema) {
    switch (schema.type) {
        case 'object':
            parseSchemaObject(schema);
        default:
            return schema;
    }
}

function parseSchemaObject(schemaObject) {
    for (const propertyName of Object.keys(schemaObject.properties)) {
        const property = schemaObject.properties[propertyName];
    }
}

function parsePropertyType(property) {
    switch (property.type) {
        case 'integer':
            return 'number';
    }
}

module.exports = {
    parseRequest
}