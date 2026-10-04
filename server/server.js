const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'f1predictor2026secret';

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/f1predictor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String, required: true },
    joined: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const DriverSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    number: { type: Number, required: true },
    flag: { type: String, required: true },
    nationality: { type: String, required: true },
    team: { type: String, required: true },
    teamColor: { type: String, required: true },
    titles: { type: Number, default: 0 },
    rookie: { type: Boolean, default: false },
    seasonPosition: { type: Number, default: null },
    seasonPoints: { type: Number, default: 0 }
});
const Driver = mongoose.model('Driver', DriverSchema);

const RaceSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    flag: { type: String, required: true },
    date: { type: String, required: true },
    circuit: { type: String, required: true }
});
const Race = mongoose.model('Race', RaceSchema);

const PredictionSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    raceId: { type: Number, required: true },
    driverId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Prediction = mongoose.model('Prediction', PredictionSchema);

const LeaderboardSchema = new mongoose.Schema({
    user: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    displayName: { type: String, required: true }
});
const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);

const { SEED_DRIVERS, SEED_RACES } = require('./seed/data');

async function seedDatabase() {
    try {
        const ids = SEED_DRIVERS.map((d) => d.id);
        await Promise.all(
            SEED_DRIVERS.map((driver) =>
                Driver.updateOne({ id: driver.id }, { $set: driver }, { upsert: true })
            )
        );
        await Driver.deleteMany({ id: { $nin: ids } });
        console.log('✅ Drivers synced');
        await Promise.all(
            SEED_RACES.map((race) =>
                Race.updateOne({ id: race.id }, { $set: race }, { upsert: true })
            )
        );
        console.log('✅ Races synced');
    } catch (error) {
        console.error('Seeding error:', error);
    }
}
seedDatabase();

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password, displayName } = req.body;
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, displayName: displayName || username });
        await user.save();
        
        // Add to leaderboard
        const leaderboard = new Leaderboard({ user: username, points: 0, displayName: displayName || username });
        await leaderboard.save();
        
        const token = jwt.sign({ username, displayName: user.displayName }, JWT_SECRET);
        res.json({ success: true, token, user: { username, displayName: user.displayName } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ username, displayName: user.displayName }, JWT_SECRET);
        res.json({ success: true, token, user: { username, displayName: user.displayName } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    res.json({ user: req.user });
});

app.get('/api/drivers', async (req, res) => {
    try {
        const drivers = await Driver.find({}, { _id: 0, __v: 0 });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/races', async (req, res) => {
    try {
        const races = await Race.find({}, { _id: 0, __v: 0 });
        res.json(races);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/predictions', authenticate, async (req, res) => {
    try {
        const predictions = await Prediction.find({ userName: req.user.username }, { _id: 0, __v: 0 });
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/predictions', authenticate, async (req, res) => {
    try {
        const { raceId, driverId } = req.body;
        const userName = req.user.username;
        let prediction = await Prediction.findOne({ userName, raceId });
        if (prediction) {
            prediction.driverId = driverId;
            prediction.updatedAt = new Date();
            await prediction.save();
            await Leaderboard.findOneAndUpdate(
                { user: userName },
                { $inc: { points: 5 } }
            );
            res.json({ success: true, prediction, updated: true });
        } else {
            prediction = new Prediction({ userName, raceId, driverId });
            await prediction.save();
            await Leaderboard.findOneAndUpdate(
                { user: userName },
                { $inc: { points: 5 } },
                { upsert: true }
            );
            res.json({ success: true, prediction, updated: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/predictions', authenticate, async (req, res) => {
    try {
        const result = await Prediction.deleteMany({ userName: req.user.username });
        await Leaderboard.findOneAndUpdate(
            { user: req.user.username },
            { points: 0 }
        );
        res.json({ success: true, count: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find({}, { _id: 0, __v: 0 })
            .sort({ points: -1 })
            .limit(10);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/export', authenticate, async (req, res) => {
    try {
        const drivers = await Driver.find({}, { _id: 0, __v: 0 });
        const races = await Race.find({}, { _id: 0, __v: 0 });
        const predictions = await Prediction.find({}, { _id: 0, __v: 0 });
        const leaderboard = await Leaderboard.find({}, { _id: 0, __v: 0 });
        const users = await User.find({}, { _id: 0, password: 0, __v: 0 });
        res.json({
            drivers,
            races,
            predictions,
            leaderboard,
            users,
            exportedAt: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});