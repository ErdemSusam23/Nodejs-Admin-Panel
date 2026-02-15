const request = require('supertest');
const app = require('../app');

describe('AuditLogs API Testleri', () => {
    let authToken;

    beforeAll(async () => {
        // Login yapıp token al
        const loginRes = await request(app)
            .post('/api/users/login')
            .send({
                email: 'test@example.com',
                password: 'Test123456'
            });

        if (loginRes.statusCode === 200) {
            authToken = loginRes.body.data.token;
        }
    });

    describe('POST /api/auditlogs - Audit log listesi', () => {
        it('Parametresiz log listesi alınabilmeli', async () => {
            const res = await request(app)
                .post('/api/auditlogs')
                .send({});

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        it('Tarih aralığı ile log listesi alınabilmeli', async () => {
            const res = await request(app)
                .post('/api/auditlogs')
                .send({
                    begin_date: '2024-01-01',
                    end_date: '2026-12-31'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        it('Sayfalama parametreleri ile log listesi alınabilmeli', async () => {
            const res = await request(app)
                .post('/api/auditlogs')
                .send({
                    skip: 0,
                    limit: 10
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeLessThanOrEqual(10);
        });

        it('Maksimum limit 500 olmalı', async () => {
            const res = await request(app)
                .post('/api/auditlogs')
                .send({
                    skip: 0,
                    limit: 1000 // 500'den fazla
                });

            expect(res.statusCode).toEqual(200);
            // Limit otomatik 500'e düşürülmeli
            expect(res.body.data.length).toBeLessThanOrEqual(500);
        });
    });
});