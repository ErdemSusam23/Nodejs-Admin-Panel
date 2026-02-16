const express = require('express');
const moment = require('moment');
const Response = require('../lib/Response');
const AuditLogs = require('../db/models/AuditLogs');
const router = express.Router();
const auth = require('../lib/auth')();

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
});

router.post('/', async (req, res) => {
    try {
        let body = req.body;
        let query = {};
        
        // Sayfalama Değerleri
        let page = body.page || 1;
        let limit = body.limit || 20;
        let skip = (page - 1) * limit;

        // Tarih Filtresi
        if (body.begin_date && body.end_date) {
            query.created_at = {
                $gte: moment(body.begin_date).startOf('day').toDate(),
                $lte: moment(body.end_date).endOf('day').toDate()
            }
        } 

        // Enum Filtreleri (Frontend 'action' gönderir, DB 'proc_type' arar)
        if (body.action) {
            query.proc_type = body.action;
        }
        if (body.resource) {
            query.location = body.resource;
        }
        if (body.email) {
            query.email = { $regex: body.email, $options: 'i' };
        }

        // Verileri Çek
        let auditLogs = await AuditLogs.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        // Toplam Sayıyı Hesapla
        let total = await AuditLogs.countDocuments(query);

        res.json(Response.successResponse({
            data: auditLogs,
            pagination: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || 500).json(errorResponse);
    }
});

module.exports = router;