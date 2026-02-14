const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const CustomError = require('./Error');
const Enums = require('../config/Enums');

class Upload {
    constructor() {
        // Dosyanın nereye ve hangi isimle kaydedileceğini belirleyen ayar
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                // Klasör yoksa oluştur (Garanti olsun)
                const dir = config.FILE_UPLOAD.PATH;
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir, { recursive: true });
                }
                cb(null, dir);
            },
            filename: function (req, file, cb) {
                // Dosya ismini çakışmasın diye değiştiriyoruz: 
                // Örn: 17823123123_resim.png
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path.extname(file.originalname); // .png, .jpg
                cb(null, uniqueSuffix + ext);
            }
        });

        // Dosya filtresi (Sadece izin verilen türler)
        const fileFilter = (req, file, cb) => {
            if (config.FILE_UPLOAD.MIMETYPES.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new CustomError(Enums.HTTP_CODES.BAD_REQUEST, "Upload Error", `Unsupported file type. Allowed: ${config.FILE_UPLOAD.MIMETYPES}`), false);
            }
        };

        this.upload = multer({ 
            storage: storage,
            fileFilter: fileFilter,
            limits: {
                fileSize: config.FILE_UPLOAD.MAX_SIZE
            }
        });
    }

    // Tekli dosya yükleme middleware'i
    single(fieldName) {
        return this.upload.single(fieldName);
    }
    
    // Çoklu dosya yükleme (İleride gerekirse)
    array(fieldName, maxCount) {
        return this.upload.array(fieldName, maxCount);
    }
}

module.exports = new Upload();