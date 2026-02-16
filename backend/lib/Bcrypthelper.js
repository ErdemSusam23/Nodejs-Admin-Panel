// lib/BcryptHelper.js - Test ortamında hızlı hash
const bcrypt = require('bcryptjs');

// Test ortamında salt rounds'u düşür
const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 1 : 10;

module.exports = {
    hashSync: (password) => {
        return bcrypt.hashSync(password, SALT_ROUNDS);
    },
    
    hash: async (password) => {
        return await bcrypt.hash(password, SALT_ROUNDS);
    },
    
    compareSync: (password, hash) => {
        return bcrypt.compareSync(password, hash);
    },
    
    compare: async (password, hash) => {
        return await bcrypt.compare(password, hash);
    }
};