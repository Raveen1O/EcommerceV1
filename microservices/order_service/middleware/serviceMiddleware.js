exports.verifyService = (req, res, next) => {

    const secret = req.headers["x-service-secret"];

    const expectedSecret = process.env.SERVICE_SECRET || "default_service_secret_123";

    if (!secret) {
        return res.status(401).json({
            message: "Missing service secret"
        });
    }

    if (secret !== expectedSecret) {
        return res.status(403).json({
            message: "Invalid service secret"
        });
    }

    next();
};