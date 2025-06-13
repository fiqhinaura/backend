import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Ambil token dari header Authorization atau cookie
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    if (!token && req.cookies && req.cookies.refreshToken) {
        token = req.cookies.refreshToken;
    }
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    });
}