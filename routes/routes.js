const express = require('express');
const router = express.Router();
const upload = require('../lib/Upload');
const Response = require('../lib/Response');
const auth = require('../lib/auth')();
const Enums = require('../config/Enums');
const CustomError = require('../lib/Error');

// Authentication ekliyoruz ama privilege (yetki) sana kalmış. 
// Şimdilik herkes yükleyebilsin diyelim veya "file_upload" yetkisi isteyebilirsin.
router.post('/', auth.authenticate(), (req, res, next) => {
    
    // Multer middleware'ini çağırıyoruz. 'file' form-data'daki key ismidir.
    upload.single('file')(req, res, (err) => {
        if (err) {
            // Multer'dan gelen hataları yakala (Dosya boyutu, tipi vs.)
            if (err instanceof CustomError) {
                return res.status(err.code).json(Response.errorResponse(err));
            }
            // Multer'ın kendi hataları (Limit vs.)
            return res.status(Enums.HTTP_CODES.BAD_REQUEST).json(Response.errorResponse(new CustomError(Enums.HTTP_CODES.BAD_REQUEST, "Upload Error", err.message)));
        }

        if (!req.file) {
            return res.status(Enums.HTTP_CODES.BAD_REQUEST).json(Response.errorResponse(new CustomError(Enums.HTTP_CODES.BAD_REQUEST, "Upload Error", "File is required")));
        }

        // Başarılı olursa dosya bilgilerini dön
        res.json(Response.successResponse({
            success: true,
            file: {
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size
            },
            // Frontend'in erişebileceği URL (Base URL + path)
            url: `/uploads/${req.file.filename}`
        }));
    });
});

module.exports = router;