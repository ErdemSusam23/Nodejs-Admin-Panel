const express = require('express');
const router = express.Router();
const auth = require('../lib/auth')();
const Response = require('../lib/Response');
const Users = require('../db/models/Users');

/* GET /auth/me - Get current user */
router.get('/me', auth.authenticate(), async (req, res) => {
    /*
        #swagger.tags = ['Auth']
        #swagger.summary = 'Get current user'
        #swagger.description = 'Retrieve the current authenticated user information'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.responses[200] = {
            description: 'User information retrieved successfully'
        }
    */
    try {
        const user = await Users.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json(Response.errorResponse(new Error('User not found')));
        }
        res.json(Response.successResponse(user));
    } catch (error) {
        res.status(500).json(Response.errorResponse(error));
    }
});

/* POST /auth/logout - Logout */
router.post('/logout', auth.authenticate(), (req, res) => {
    /*
        #swagger.tags = ['Auth']
        #swagger.summary = 'Logout'
        #swagger.description = 'Logout the current user'
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.responses[200] = {
            description: 'Logged out successfully'
        }
    */
    // Since JWT is stateless, we just return success
    // Client should remove the token
    res.json(Response.successResponse({ message: 'Logged out successfully' }));
});

module.exports = router;