const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = { id: user._id, username: user.username, displayName: user.displayName };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;
