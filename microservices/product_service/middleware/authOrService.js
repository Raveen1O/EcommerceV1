const { verifyToken } = require('./authMiddleware');
const { verifyAdmin } = require('./adminMiddleware');
const { verifyService } = require('./serviceMiddleware');

exports.authOrService = (req, res, next) => {

    // Inventory service / internal microservice
    if (req.headers["x-service-secret"]) {
        return verifyService(req, res, next);
    }

    // Admin user
    verifyToken(req, res, () => {
        verifyAdmin(req, res, next);
    });

};