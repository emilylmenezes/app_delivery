const { authenticateToken } = require('../Utils/jwt');

module.exports = async (req, res, next) => {
    const { authorization: token } = req.headers;
    const { status, message} = await authenticateToken(token);
    if (status) return res.status(status).json(message);
    req.data = message;
    next();
  };
