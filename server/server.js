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
    flag: { type: String, required: true },
    team: { type: String, required: true }
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

const SEED_DRIVERS = [
    { id: 'ver', name: 'Max Verstappen', code: 'VER', flag: '🇳🇱', team: 'Red Bull Racing' },
    { id: 'had', name: 'Isack Hadjar', code: 'HAD', flag: '🇫🇷', team: 'Red Bull Racing' },
    { id: 'lec', name: 'Charles Leclerc', code: 'LEC', flag: '🇲🇨', team: 'Ferrari' },
    { id: 'ham', name: 'Lewis Hamilton', code: 'HAM', flag: '🇬🇧', team: 'Ferrari' },
    { id: 'nor', name: 'Lando Norris', code: 'NOR', flag: '🇬🇧', team: 'McLaren' },
    { id: 'pia', name: 'Oscar Piastri', code: 'PIA', flag: '🇦🇺', team: 'McLaren' },
    { id: 'rus', name: 'George Russell', code: 'RUS', flag: '🇬🇧', team: 'Mercedes' },
    { id: 'kim', name: 'Kimi Antonelli', code: 'ANT', flag: '🇮🇹', team: 'Mercedes' },
    { id: 'alo', name: 'Fernando Alonso', code: 'ALO', flag: '🇪🇸', team: 'Aston Martin' },
    { id: 'str', name: 'Lance Stroll', code: 'STR', flag: '🇨🇦', team: 'Aston Martin' },
    { id: 'gas', name: 'Pierre Gasly', code: 'GAS', flag: '🇫🇷', team: 'Alpine' },
    { id: 'pin', name: 'Franco Colapinto', code: 'COL', flag: '🇦🇷', team: 'Alpine' },
    { id: 'tsu', name: 'Yuki Tsunoda', code: 'TSU', flag: '🇯🇵', team: 'RB' },
    { id: 'lin', name: 'Arvid Lindblad', code: 'LIN', flag: '🇸🇪', team: 'RB' },
    { id: 'hul', name: 'Nico Hülkenberg', code: 'HUL', flag: '🇩🇪', team: 'Audi' },
    { id: 'gab', name: 'Gabriel Bortoleto', code: 'BOR', flag: '🇧🇷', team: 'Audi' },
    { id: 'oli', name: 'Ollie Bearman', code: 'BEA', flag: '🇬🇧', team: 'Haas' },
    { id: 'oco', name: 'Esteban Ocon', code: 'OCO', flag: '🇫🇷', team: 'Haas' },
    { id: 'sai', name: 'Carlos Sainz', code: 'SAI', flag: '🇪🇸', team: 'Williams' },
    { id: 'alb', name: 'Alexander Albon', code: 'ALB', flag: '🇹🇭', team: 'Williams' },
    { id: 'bot', name: 'Valtteri Bottas', code: 'BOT', flag: '🇫🇮', team: 'Cadillac' },
    { id: 'per', name: 'Sergio Pérez', code: 'PER', flag: '🇲🇽', team: 'Cadillac' }
];

const SEED_RACES = [
    { id: 0, name: 'Australian GP', flag: '🇦🇺', date: '2026-03-08', circuit: 'Albert Park' },
    { id: 1, name: 'Chinese GP', flag: '🇨🇳', date: '2026-03-22', circuit: 'Shanghai' },
    { id: 2, name: 'Japanese GP', flag: '🇯🇵', date: '2026-04-05', circuit: 'Suzuka' },
    { id: 3, name: 'Bahrain GP', flag: '🇧🇭', date: '2026-04-19', circuit: 'Sakhir' },
    { id: 4, name: 'Saudi Arabian GP', flag: '🇸🇦', date: '2026-05-03', circuit: 'Jeddah' },
    { id: 5, name: 'Miami GP', flag: '🇺🇸', date: '2026-05-17', circuit: 'Miami' },
    { id: 6, name: 'Monaco GP', flag: '🇲🇨', date: '2026-05-31', circuit: 'Monte Carlo' },
    { id: 7, name: 'Spanish GP', flag: '🇪🇸', date: '2026-06-14', circuit: 'Barcelona' },
    { id: 8, name: 'Canadian GP', flag: '🇨🇦', date: '2026-06-28', circuit: 'Montreal' },
    { id: 9, name: 'Austrian GP', flag: '🇦🇹', date: '2026-07-12', circuit: 'Spielberg' },
    { id: 10, name: 'British GP', flag: '🇬🇧', date: '2026-07-26', circuit: 'Silverstone' },
    { id: 11, name: 'Belgian GP', flag: '🇧🇪', date: '2026-08-09', circuit: 'Spa' },
    { id: 12, name: 'Hungarian GP', flag: '🇭🇺', date: '2026-08-23', circuit: 'Hungaroring' },
    { id: 13, name: 'Dutch GP', flag: '🇳🇱', date: '2026-09-06', circuit: 'Zandvoort' },
    { id: 14, name: 'Italian GP', flag: '🇮🇹', date: '2026-09-13', circuit: 'Monza' },
    { id: 15, name: 'Azerbaijan GP', flag: '🇦🇿', date: '2026-09-27', circuit: 'Baku' },
    { id: 16, name: 'Singapore GP', flag: '🇸🇬', date: '2026-10-11', circuit: 'Marina Bay' },
    { id: 17, name: 'United States GP', flag: '🇺🇸', date: '2026-10-25', circuit: 'COTA' },
    { id: 18, name: 'Mexican GP', flag: '🇲🇽', date: '2026-11-01', circuit: 'Mexico City' },
    { id: 19, name: 'Brazilian GP', flag: '🇧🇷', date: '2026-11-15', circuit: 'Interlagos' },
    { id: 20, name: 'Las Vegas GP', flag: '🇺🇸', date: '2026-11-22', circuit: 'Las Vegas' },
    { id: 21, name: 'Qatar GP', flag: '🇶🇦', date: '2026-12-06', circuit: 'Lusail' },
    { id: 22, name: 'Abu Dhabi GP', flag: '🇦🇪', date: '2026-12-13', circuit: 'Yas Marina' }
];

async function seedDatabase() {
    try {
        const driverCount = await Driver.countDocuments();
        if (driverCount === 0) {
            await Driver.insertMany(SEED_DRIVERS);
            console.log('✅ Drivers seeded');
        }
        const raceCount = await Race.countDocuments();
        if (raceCount === 0) {
            await Race.insertMany(SEED_RACES);
            console.log('✅ Races seeded');
        }
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