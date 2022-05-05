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
                    default: 'swagger.yml',
                    message: 'Enter path for openapi file (json or yaml): '
                },
                {
                    type: 'list',
                    name: 'database',
                    message: 'Select database support: ',
                    choices: [
                        {
                            name: 'SQLite',
                            value: 'sqlite',
                        }, {
                            name: 'Oracle',
                            value: 'oracle'

                        }, {
                            name: 'PostgreSQL',
                            value: 'postgresql'
                        }, {
                            name: 'None',
                            value: null
                        }
                    ]
                }
            ],
        );

        this.destinationRoot(answers.msName);

        // root project files
        this.fs.copy(
            this.templatePath('rootfiles/*'),
            this.destinationPath(this.destinationRoot()),
        );

        this.fs.copy(
            this.templatePath('rootfiles/.*'),
            this.destinationPath(this.destinationRoot()),
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

        // api routes, controller and main server
        const api = await openapiParser.parse(answers.openapiPath);

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
                { controller: controllers[controller], name: controller },
            );
            this.fs.copyTpl(
                this.templatePath('src/api/controllers/controller.tpl.ejs'),
                this.destinationPath(`src/api/controllers/${controller}.ctrl.ts`),
                { controller: controllers[controller], name: controller },
            );
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