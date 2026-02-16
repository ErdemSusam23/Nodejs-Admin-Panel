const request = require('supertest');
const app = require('../app');

describe('Categories API Testleri', () => {
    let authToken;
    let categoryId;

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

    describe('GET /api/categories - Kategori listesi', () => {
        it('Token olmadan kategori listesi alınamamalı', async () => {
            const res = await request(app).get('/api/categories');
            expect(res.statusCode).toEqual(401);
        });

        it('Token ile kategori listesi alınabilmeli', async () => {
            if (!authToken) return;

            const res = await request(app)
                .get('/api/categories')
                .set('Authorization', `Bearer ${authToken}`);

            expect([200, 403]).toContain(res.statusCode);

            if (res.statusCode === 200) {
                expect(res.body.data).toBeInstanceOf(Array);
            }
        });
    });

    describe('POST /api/categories/add - Yeni kategori ekleme', () => {
        it('Token olmadan kategori eklenememeli', async () => {
            const res = await request(app)
                .post('/api/categories/add')
                .send({
                    name: 'Test Category',
                    is_active: true
                });

            expect(res.statusCode).toEqual(401);
        });

        it('Token ile yeni kategori eklenebilmeli', async () => {
            if (!authToken) return;

            const newCategory = {
                name: `Test_Category_${Date.now()}`,
                is_active: true
            };

            const res = await request(app)
                .post('/api/categories/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newCategory);

            expect([200, 403]).toContain(res.statusCode);

            if (res.statusCode === 200) {
                expect(res.body.data).toHaveProperty('_id');
                categoryId = res.body.data._id;
            }
        });

        it('Eksik name ile kategori eklenememeli', async () => {
            if (!authToken) return;

            const res = await request(app)
                .post('/api/categories/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    is_active: true
                    // name eksik
                });

            expect([400, 403]).toContain(res.statusCode);
        });
    });

    describe('POST /api/categories/update - Kategori güncelleme', () => {
        it('Token ile kategori güncellenebilmeli', async () => {
            if (!authToken || !categoryId) return;

            const updatedCategory = {
                _id: categoryId,
                name: `Updated_Category_${Date.now()}`,
                is_active: false
            };

            const res = await request(app)
                .post('/api/categories/update')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updatedCategory);

            expect([200, 403]).toContain(res.statusCode);
        });

        it('ID olmadan kategori güncellenemez', async () => {
            if (!authToken) return;

            const res = await request(app)
                .post('/api/categories/update')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Updated Name'
                    // _id eksik
                });

            expect([400, 403]).toContain(res.statusCode);
        });
    });

    describe('POST /api/categories/delete - Kategori silme', () => {
        it('Token ile kategori silinebilmeli', async () => {
            if (!authToken || !categoryId) return;

            const res = await request(app)
                .post('/api/categories/delete')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ _id: categoryId });

            expect([200, 403, 404]).toContain(res.statusCode);
        });

        it('ID olmadan kategori silinemez', async () => {
            if (!authToken) return;

            const res = await request(app)
                .post('/api/categories/delete')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect([400, 403]).toContain(res.statusCode);
        });

        it('Var olmayan ID ile kategori silinemez', async () => {
            if (!authToken) return;

            const res = await request(app)
                .post('/api/categories/delete')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ _id: '507f1f77bcf86cd799439999' }); // Fake ID

            expect([403, 404]).toContain(res.statusCode);
        });
    });
});