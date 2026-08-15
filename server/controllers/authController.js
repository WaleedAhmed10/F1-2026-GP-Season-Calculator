const crypto = require('crypto');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const { asyncHandler, ConflictError, ValidationError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');

/**
 * User signup - username only, no password needed
 */
exports.signup = asyncHandler(async (req, res) => {
  const { username, displayName } = req.body;

  if (!username || username.trim().length < 3) {
    throw new ValidationError('Username must be at least 3 characters');
  }

  const existing = await User.findOne({ username });
  if (existing) {
    throw new ConflictError('Username already taken');
  }

  const finalDisplayName = displayName || username;
  const token = crypto.randomBytes(16).toString('hex');

  const user = await User.create({
    username,
    displayName: finalDisplayName,
    token
  });

  await Leaderboard.create({
    user: username,
    points: 0,
    correctWinners: 0,
    displayName: finalDisplayName
  });

  sendSuccess(
    res,
    {
      token,
      user: { username: user.username, displayName: user.displayName }
    },
    'Account created',
    201
  );
});

/**
 * User signin - just username, no password
 */
exports.signin = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw new ValidationError('Username required');
  }

  let user = await User.findOne({ username });

  if (!user) {
    throw new ValidationError('Username not found. Sign up first.');
  }

  sendSuccess(res, {
    token: user.token,
    user: { username: user.username, displayName: user.displayName }
  }, 'Logged in');
});

/**
 * Get current user information
 */
exports.me = asyncHandler((req, res) => {
  if (!req.user) {
    throw new AuthenticationError();
  }

  sendSuccess(res, { user: req.user }, 'User information retrieved');
});
