const mongoose = require("mongoose");
const config = require("../config"); // Config dosyasını direkt buraya alıyoruz

let instance = null;

class Database {
    constructor() {
        if (!instance) {
            this.mongoConnection = null;
            instance = this;
        }
        return instance;
    }

    async connect(options) {
        try {
            // Eğer parametre gelmezse config'den al
            let dbUrl = options?.connectionString || config.CONNECTION_STRING;

            let db = await mongoose.connect(dbUrl, {
                // Mongoose 7+ varsayılanları zaten iyidir ama timeout ekleyelim
                serverSelectionTimeoutMS: 5000 
            });

            this.mongoConnection = db;
        } catch (err) {
            console.error("Database Connection Error:", err);
            process.exit(1); // Bağlantı yoksa uygulamayı öldür
        }
    }
}

module.exports = Database;