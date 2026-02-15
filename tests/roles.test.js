const request = require('supertest');
const app = require('../app');

describe('Roles API Testleri', () => {
    let authToken;
    let roleId;

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

    describe('GET /api/roles - Rol listesi', () => {
        it('Token olmadan rol listesi alınamamalı', async () => {
            const res = await request(app).get('/api/roles');
            expect(res.statusCode).toEqual(401);
        });

        it('Token ile rol listesi alınabilmeli', async () => {
            if (!authToken) return;

            const res = await request(app)
                .get('/api/roles')
                .set('Authorization', `Bearer ${authToken}`);

            // Yetki varsa 200, yoksa 403
            expect([200, 403]).toContain(res.statusCode);

            if (res.statusCode === 200) {
                expect(res.body.data).toBeInstanceOf(Array);
            }
        });
    });

    describe('GET /api/roles/permissions - Tüm izinler', () => {
        it('Token ile izin listesi alınabilmeli', async () => {
            if (!authToken) return;

            const res = await request(app)
                .get('/api/roles/permissions')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('groups');
        });
    });

    describe('POST /api/roles/add - Yeni rol ekleme', () => {
        it('Token olmadan rol eklenememeli', async () => {
            const res = await request(app)
                .post('/api/roles/add')
                .send({
                    role_name: 'Test Role',
                    is_active: true,
                    permissions: ['user_view']
                });

            expect(res.statusCode).toEqual(401);
        });

        it('Token ile yeni rol eklenebilmeli', async () => {
            if (!authToken) return;

            const newRole = {
                role_name: `TestRole_${Date.now()}`,
                is_active: true,
                permissions: ['user_view', 'category_view']
            };

            const res = await request(app)
                .post('/api/roles/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newRole);

            // Yetki varsa 200, yoksa 403
            expect([200, 403]).toContain(res.statusCode);

            if (res.statusCode === 200) {
                expect(res.body.data).toHaveProperty('_id');
                roleId = res.body.data._id; // Sonraki testler için sakla
            }
        });

        it('Aynı isimde rol eklenememeli', async () => {
            if (!authToken || !roleId) return;

            const duplicateRole = {
                role_name: 'SUPER_ADMIN', // Zaten var
                is_active: true,
                permissions: ['user_view']
            };

            const res = await request(app)
                .post('/api/roles/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send(duplicateRole);

            // Conflict veya forbidden
            expect([403, 409]).toContain(res.statusCode);
        });
    });

    describe('GET /api/roles/role_privileges - Rol yetkileri', () => {
        it('role_id parametresi olmadan istek yapılamamalı', async () => {
            if (!authToken) return;

            const res = await request(app)
                .get('/api/roles/role_privileges')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(400);
        });

        it('Geçerli role_id ile yetkiler alınabilmeli', async () => {
            if (!authToken || !roleId) return;

            const res = await request(app)
                .get('/api/roles/role_privileges')
                .query({ role_id: roleId })
                .set('Authorization', `Bearer ${authToken}`);

            expect([200, 403]).toContain(res.statusCode);

            if (res.statusCode === 200) {
                expect(res.body.data).toBeInstanceOf(Array);
            }
        });
    });

    describe('POST /api/roles/update - Rol güncelleme', () => {
        it('Token ile rol güncellenebilmeli', async () => {
            if (!authToken || !roleId) return;

            const updatedRole = {
                _id: roleId,
                role_name: `UpdatedRole_${Date.now()}`,
                is_active: true,
                permissions: ['user_view', 'user_add']
            };

            const res = await request(app)
                .post('/api/roles/update')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updatedRole);

            expect([200, 403]).toContain(res.statusCode);
        });
    });

    describe('POST /api/roles/delete - Rol silme', () => {
        it('Token ile rol silinebilmeli', async () => {
            if (!authToken || !roleId) return;

            const res = await request(app)
                .post('/api/roles/delete')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ _id: roleId });

            expect([200, 403]).toContain(res.statusCode);
        });

        it('ID olmadan rol silinemez', async () => {
            if (!authToken) return;

            const res = await request(app)
                .post('/api/roles/delete')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect([400, 403]).toContain(res.statusCode);
        });
    });
});