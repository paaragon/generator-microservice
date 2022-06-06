const SwaggerParser = require("@apidevtools/swagger-parser");

async function parse(openapipath) {
    try {
        const api = await SwaggerParser.validate(openapipath);
        console.log("API name: %s, Version: %s", api.info.title, api.info.version);
        return transform(api);
    } catch (err) {
        console.error(err);
    }
}

function transform(api) {
    const paths = []; /** {endpoint: string, method: string, controller: string, functionName: string} */
    for (const endpoint of Object.keys(api.paths)) {
        const methods = Object.keys(api.paths[endpoint]);
        for (const method of methods) {
            const methodInfo = api.paths[endpoint][method];
            const functionName = getFunctionName(endpoint, method, methodInfo);
            const controller = getControllerName(methodInfo);
            const endpointPath = toExpressEndpoint(endpoint, controller);
            const path = { endpoint: endpointPath, method, controller, functionName, functionNameCapitalized: functionName.replace(/./, c => c.toUpperCase()) };
            paths.push(path);
        }
    }

    return paths;
}

function toExpressEndpoint(endpoint, controller) {
    let endpointPath = endpoint.replace(/{(.*)}/g, ':$1');
    const regex = new RegExp(`^\/${controller}`);
    endpointPath = endpointPath.replace(regex, '');
    if (endpointPath === '') {
        endpointPath = '/';
    }
    return endpointPath
}

function getControllerName(methodInfo) {
    return methodInfo.tags && methodInfo.tags.length > 0 ? methodInfo.tags[0] : 'root';
}

function getFunctionName(endpoint, method, methodInfo) {
    if (methodInfo.operationId) {
        return methodInfo.operationId;
    }

    return methodToFunctionName(method) + paramsToByInEndpoint(snakeToCamel(endpoint));
}

function snakeToCamel(str) {
    if (!(/[\/_-]/).test(str)) return str;

    return str.replace(/([-_\/])([a-z])/g, (_match, _p1, p2) => p2.toUpperCase());
}

function paramsToByInEndpoint(endpoint) {
    if (!(/({(.*)})/).test(endpoint)) return endpoint;

    return endpoint.replace(/\/({(.*)})/g, (_match, _p1, p2) => `By${p2.charAt(0).toUpperCase()}${p2.slice(1)}`)
}

function methodToFunctionName(method) {
    switch (method) {
        case 'get':
            return 'get';
        case 'post':
            return 'add';
        case 'put':
            return 'update';
        case 'delete':
            return 'delete';
        case 'patch':
            return 'partialUpdate';
    }
}

module.exports = {
    parse
};