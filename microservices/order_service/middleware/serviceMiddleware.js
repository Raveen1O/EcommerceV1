exports.verifyService = (req, res, next) => {

    const secret = req.headers["x-service-secret"];

    if (!secret) {
        return res.status(401).json({
            message: "Missing service secret"
        });
    }

    if (secret !== process.env.SERVICE_SECRET) {
        return res.status(403).json({
            message: "Invalid service secret"
        });
    }

    next();
};