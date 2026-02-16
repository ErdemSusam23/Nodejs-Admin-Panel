const request = require('supertest');
const app = require('../app');

describe('Temel API Kontrolleri', () => {
    
    it('GET / -> Swagger Dokümantasyonuna Yönlendirmeli', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(302);
        expect(res.headers.location).toBe('/api/docs');
    });

    it('GET /api/docs -> Swagger UI erişilebilir olmalı', async () => {
        const res = await request(app).get('/api/docs');
        // Swagger redirect veya 200 olabilir
        expect([200, 301, 302]).toContain(res.statusCode);
    });

    it('POST /api/users/login -> Endpoint erişilebilir olmalı', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: 'test@test.com',
                password: 'test123'
            });
        
        // 400 (validation) veya 401 (auth failed) bekleniyor, 500 olmamalı
        expect([400, 401]).toContain(res.statusCode);
    }, 30000);

    it('GET /api/users -> Auth gerektirmeli', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toEqual(401);
    });

    it('POST /api/categories/add -> Auth gerektirmeli', async () => {
        const res = await request(app)
            .post('/api/categories/add')
            .send({ name: 'Test' });
        
        expect(res.statusCode).toEqual(401);
    });
});