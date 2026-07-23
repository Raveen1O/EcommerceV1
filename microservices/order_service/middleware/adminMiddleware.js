exports.verifyAdmin = (req, res, next) => {

    const groups = req.user["cognito:groups"] || [];

    if (!groups.includes("Admin")) {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    next();
};