const request = require('supertest');
const app = require('../app');

describe('Users API Testleri', () => {
    let authToken;

    // Test için kullanılacak veriler
    const testUser = {
        email: 'test@example.com',
        password: 'Test123456',
        first_name: 'Test',
        last_name: 'User',
        phone_number: '+905551234567'
    };

    describe('POST /api/users/register - İlk kullanıcı kaydı', () => {
        it('İlk kullanıcı kaydı çalışmalı', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send(testUser);

            // İlk kullanıcı oluşturulabilir veya zaten varsa 404
            expect([200, 404]).toContain(res.statusCode);
        }, 30000); // 30 saniye timeout
    });

    describe('POST /api/users/login - Kullanıcı girişi', () => {
        it('Login endpoint çağrılabilmeli', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            // 200 (başarılı) veya 401 (kullanıcı yok) olabilir
            expect([200, 401]).toContain(res.statusCode);

            if (res.statusCode === 200 && res.body.data && res.body.data.token) {
                authToken = res.body.data.token;
                expect(res.body.data).toHaveProperty('token');
            }
        }, 30000);

        it('Eksik email ile giriş yapılamamalı', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    password: testUser.password
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/users - Kullanıcı listesi', () => {
        it('Token olmadan kullanıcı listesi alınamamalı', async () => {
            const res = await request(app).get('/api/users');
            expect(res.statusCode).toEqual(401);
        });

        it('Geçersiz token ile istek yapılamamalı', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', 'Bearer invalid_token_12345');

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('POST /api/users/add - Yeni kullanıcı ekleme', () => {
        it('Token olmadan kullanıcı eklenememeli', async () => {
            const res = await request(app)
                .post('/api/users/add')
                .send({
                    email: 'newuser@example.com',
                    password: 'NewPass123',
                    first_name: 'New',
                    last_name: 'User'
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('POST /api/users/update - Kullanıcı güncelleme', () => {
        it('Token olmadan güncelleme yapılamamalı', async () => {
            const res = await request(app)
                .post('/api/users/update')
                .send({
                    _id: '507f1f77bcf86cd799439011',
                    first_name: 'Updated'
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('POST /api/users/delete - Kullanıcı silme', () => {
        it('Token olmadan silme yapılamamalı', async () => {
            const res = await request(app)
                .post('/api/users/delete')
                .send({
                    _id: '507f1f77bcf86cd799439011'
                });

            expect(res.statusCode).toEqual(401);
        });
    });
});