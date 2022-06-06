'use strict';
const Generator = require('yeoman-generator');
const openapiParser = require('./openapi/parser');
const { generateApi } = require('swagger-typescript-api');
const path = require("path");
const fs = require("fs");

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.log('Initializing...');
    }
    async start() {
        const answers = await this.prompt(
            [
                {
                    type: 'input',
                    name: 'msName',
                    message: 'Enter a name for the new microservice: '
                },
                {
                    type: 'input',
                    name: 'openapiPath',
                    default: 'None',
                    message: 'Enter path for openapi file (json or yaml): '
                },
                {
                    type: 'list',
                    name: 'database',
                    message: 'Select database support: ',
                    choices: [
                        {
                            name: 'None',
                            value: null
                        },
                        {
                            name: 'SQLite',
                            value: 'sqlite',
                        },
                        {
                            name: 'Oracle',
                            value: 'oracle'

                        },
                        {
                            name: 'PostgreSQL',
                            value: 'postgresql'
                        },
                    ],
                },
                {
                    type: 'port',
                    name: 'port',
                    default: '3000',
                    message: 'Enter a port for the server'
                },
            ],
        );

        this.destinationRoot(answers.msName);

        // root project files
        this.fs.copy(
            this.templatePath('rootfiles/*'),
            this.destinationPath(this.destinationRoot()),
        );

        // config folder
        this.fs.copy(
            this.templatePath('rootfiles/config/development.json'),
            this.destinationPath(`${this.destinationRoot()}/config/development.json`),
        );

        this.fs.copyTpl(
            this.templatePath('rootfiles/config/default.tpl.ejs'),
            this.destinationPath(`${this.destinationRoot()}/config/default.json`),
            {port: answers.port}
        );

        // src static files
        this.fs.copyTpl(
            this.templatePath('src/app.ts'),
            this.destinationPath('src/app.ts'),
            { database: answers.database },
        );

        this.fs.copyTpl(
            this.templatePath('src/config.ts'),
            this.destinationPath('src/config.ts'),
            { database: answers.database },
        );

        this.fs.copyTpl(
            this.templatePath('src/lib'),
            this.destinationPath('src/lib'),
        );

        this.fs.copyTpl(
            this.templatePath('src/logger'),
            this.destinationPath('src/logger'),
        );

        // database
        if (answers.database) {
            this.fs.copyTpl(
                this.templatePath('src/infrastructure'),
                this.destinationPath('src/infrastructure'),
                { database: answers.database },
            );
        }

        // api static files
        this.fs.copy(
            this.templatePath('src/api/exceptions'),
            this.destinationPath('src/api/exceptions'),
        );

        this.fs.copy(
            this.templatePath('src/api/mdw'),
            this.destinationPath('src/api/mdw'),
        );

        this.fs.copy(
            this.templatePath('src/api/model'),
            this.destinationPath('src/api/model'),
        );

        this.fs.copy(
            this.templatePath('src/api/controllers/health.ctrl.ts'),
            this.destinationPath('src/api/controllers/health.ctrl.ts'),
        );

        this.fs.copy(
            this.templatePath('src/api/routes/health.routes.ts'),
            this.destinationPath('src/api/routes/health.routes.ts'),
        );

        const openapiPath = answers.openapiPath !== 'None' ? answers.openapiPath : `${__dirname}/openapi/default-openapi.json`;
        // api routes, controller and main server
        const api = await openapiParser.parse(openapiPath);

        const controllers = api.reduce((prev, curr) => {
            const ctrl = prev[curr.controller] || [];
            ctrl.push(curr);
            prev[curr.controller] = ctrl;
            return prev;
        }, {});

        for (const controller of Object.keys(controllers)) {
            this.fs.copyTpl(
                this.templatePath('src/api/routes/route.tpl.ejs'),
                this.destinationPath(`src/api/routes/${controller}.routes.ts`),
                { controller: controllers[controller], name: controller, nameCapitalized: controller.replace(/./, c => c.toUpperCase()) },
            );
            this.fs.copyTpl(
                this.templatePath('src/api/controllers/controller.tpl.ejs'),
                this.destinationPath(`src/api/controllers/${controller}.ctrl.ts`),
                { controller: controllers[controller], name: controller, nameCapitalized: controller.replace(/./, c => c.toUpperCase()) },
            );
            for (const path of controllers[controller]) {
                this.fs.copyTpl(
                    this.templatePath('src/api/schema/request.tpl.ejs'),
                    this.destinationPath(`src/api/schema/${path.functionNameCapitalized}Request.ts`),
                    { path },
                );
                this.fs.copyTpl(
                    this.templatePath('src/api/schema/response.tpl.ejs'),
                    this.destinationPath(`src/api/schema/${path.functionNameCapitalized}Response.ts`),
                    { path },
                );
            }
        }

        this.fs.copyTpl(
            this.templatePath('src/api/server.tpl.ejs'),
            this.destinationPath(`src/api/server.ts`),
            { controllers: controllers },
        );

        // api scheme
        generateApi({
            name: "schema.ts",
            output: this.destinationPath(`src/api/schema`),
            input: path.resolve(process.cwd(), answers.openapiPath),
            generateClient: false,
            generateRouteTypes: true,
            generateResponses: true,
            extractRequestBody: true,
            extractRequestParams: true,
            modular: true,
        });
    }
};