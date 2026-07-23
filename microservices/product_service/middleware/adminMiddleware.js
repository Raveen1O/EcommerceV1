exports.verifyAdmin = (req, res, next) => {

    console.log("verifyAdmin called");
    console.log(req.user);

    const groups = req.user["cognito:groups"] || [];

    console.log("Groups:", groups);

    if (!groups.includes("Admin")) {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    console.log("Admin verified");

    next();
};