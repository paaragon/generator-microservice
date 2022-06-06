const fs = require('fs');
const parser = require('../../app/openapi/swaggerModelParser');

describe('Parse swagger model', () => {
    test('POST /pet', () => {
        const mock = JSON.parse(fs.readFileSync(__dirname + '/../mock/swagger.json').toString());

        const m1 = mock.paths['/pet'].post;
        const result = parser.parseRequest(m1);

        expect(result.body).toHaveLength(6);
        expect(result.body[0]).toMatchObject({ name: 'id', type: 'number', optional: true });
        expect(result.body[1]).toMatchObject({ name: 'category', type: 'object', optional: true, properties: ['id', 'name'] });
        expect(result.body[2]).toMatchObject({ name: 'name', type: 'string', optional: false });
        expect(result.body[3]).toMatchObject({ name: 'photoUrls', type: 'array', optional: false, items: { type: 'string' } });
        expect(result.body[4]).toMatchObject({ name: 'category__id', type: 'number', optional: false });
        expect(result.body[5]).toMatchObject({ name: 'category__name', type: 'string', optional: false });
        expect(result.path).toBeNull();
        expect(result.query).toBeNull();
        expect(result.header).toBeNull();
    });
});