import { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { useToast } from './hooks/useToast';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import PredictionPanel from './components/PredictionPanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import StandingsPanel from './components/StandingsPanel';
import SimulationPanel from './components/SimulationPanel';
import MyPredictions from './components/MyPredictions';

const TABS = ['predict', 'standings', 'simulation'];

export default function App() {
  const [drivers, setDrivers] = useState([]);
  const [races, setRaces] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedRace, setSelectedRace] = useState(0);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('predict');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const loadPublicData = useCallback(async () => {
    try {
      const [driversData, racesData, lbData, dsData, csData, simData] = await Promise.all([
        api.getDrivers(),
        api.getRaces(),
        api.getLeaderboard(),
        api.getDriverStandings(),
        api.getConstructorStandings(),
        api.getSimulation()
      ]);
      setDrivers(driversData);
      setRaces(racesData);
      setLeaderboard(lbData);
      setDriverStandings(dsData);
      setConstructorStandings(csData);
      setSimulation(simData);
      if (driversData.length && !selectedDriver) setSelectedDriver(driversData[0].id);
      const firstOpen = racesData.find((r) => r.status === 'upcoming');
      if (firstOpen) setSelectedRace(firstOpen.id);
    } catch {
      showToast('Failed to load data', 'error');
    }
  }, [selectedDriver, showToast]);

  const loadPredictions = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getPredictions();
      setPredictions(data);
    } catch (err) {
      if (err.message !== 'Authentication required') {
        showToast('Failed to load predictions', 'error');
      }
    }
  }, [user, showToast]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) setUser(JSON.parse(savedUser));
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const handleAuth = async () => {
    if (!authUsername || !authPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = isSignUp
        ? await api.signup(authUsername, authPassword, authUsername)
        : await api.signin(authUsername, authPassword);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthModalOpen(false);
      showToast(`Welcome ${data.user.displayName}!`, 'success');
      loadPublicData();
      loadPredictions();
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPredictions([]);
    showToast('Signed out', 'info');
  };

  const handleSubmitPrediction = async () => {
    if (!user) {
      showToast('Please sign in first', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const data = await api.submitPrediction(selectedRace, selectedDriver);
      showToast(`Prediction ${data.updated ? 'updated' : 'saved'}!`, 'success');
      loadPredictions();
      loadPublicData();
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!user || !window.confirm('Reset all your predictions?')) return;
    setLoading(true);
    try {
      const data = await api.deletePredictions();
      showToast(`Reset ${data.count} predictions`, 'info');
      loadPredictions();
      loadPublicData();
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleExport = async () => {
    if (!user) {
      showToast('Please sign in to export', 'error');
      return;
    }
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `f1_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="app-container">
      <Header
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'predict' && <><i className="fas fa-bullseye" /> Predict</>}
            {tab === 'standings' && <><i className="fas fa-chart-bar" /> Standings</>}
            {tab === 'simulation' && <><i className="fas fa-dice" /> Simulation</>}
          </button>
        ))}
      </nav>

      {activeTab === 'predict' && (
        <>
          <div className="predictor-grid">
            <PredictionPanel
              races={races}
              drivers={drivers}
              selectedRace={selectedRace}
              selectedDriver={selectedDriver}
              onRaceChange={setSelectedRace}
              onDriverSelect={setSelectedDriver}
              onSubmit={handleSubmitPrediction}
              loading={loading}
            />
            <LeaderboardPanel leaderboard={leaderboard} user={user} onRefresh={loadPublicData} />
          </div>
          <MyPredictions predictions={predictions} races={races} />
        </>
      )}

      {activeTab === 'standings' && (
        <StandingsPanel driverStandings={driverStandings} constructorStandings={constructorStandings} />
      )}

      {activeTab === 'simulation' && <SimulationPanel simulation={simulation} />}

      <div className="footer-actions">
        <div className={`toast-message ${toast.type}`}>
          <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-triangle' : 'fa-circle'}`} />
          {toast.message}
        </div>
        <div className="footer-buttons">
          <button className="btn-secondary" onClick={handleReset}><i className="fas fa-undo-alt" /> Reset</button>
          <button className="btn-secondary" onClick={handleExport}><i className="fas fa-download" /> Export</button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        isSignUp={isSignUp}
        onClose={() => setIsAuthModalOpen(false)}
        onToggleMode={() => setIsSignUp(!isSignUp)}
        onSubmit={handleAuth}
        loading={loading}
        username={authUsername}
        password={authPassword}
        onUsernameChange={setAuthUsername}
        onPasswordChange={setAuthPassword}
      />
    </div>
  );
}
