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
        
        // --- SAYFALAMA AYARLARI (DÜZELTİLDİ) ---
        // Frontend'den string gelse bile integer'a çeviriyoruz.
        let page = parseInt(body.page) || 1;
        let limit = parseInt(body.limit) || 20;
        
        // Sayfa 1'den küçükse 1 yap
        if (page < 1) page = 1;
        
        // Skip hesabı: (Sayfa Sayısı - 1) * Limit
        let skip = (page - 1) * limit;

        // --- TARİH FİLTRESİ ---
        if (body.begin_date && body.end_date) {
            query.created_at = {
                $gte: moment(body.begin_date).startOf('day').toDate(),
                $lte: moment(body.end_date).endOf('day').toDate()
            }
        } 

        // --- DİĞER FİLTRELER ---
        if (body.action) query.proc_type = body.action;
        if (body.resource) query.location = body.resource;
        if (body.email) query.email = { $regex: body.email, $options: 'i' };

        // --- VERİLERİ ÇEK ---
        let auditLogs = await AuditLogs.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        // --- TOPLAM SAYIYI HESAPLA ---
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