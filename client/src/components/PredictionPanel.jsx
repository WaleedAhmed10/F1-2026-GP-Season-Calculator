export default function PredictionPanel({
  races,
  drivers,
  selectedRace,
  selectedDriver,
  onRaceChange,
  onDriverSelect,
  onSubmit,
  loading
}) {
  const currentRace = races.find((r) => r.id === selectedRace);
  const isLocked = currentRace?.status === 'locked' || currentRace?.status === 'completed';

  return (
    <div className="card">
      <div className="card-title">
        <i className="fas fa-bullseye" /> Make your prediction
      </div>
      <div className="race-selector">
        <label><i className="far fa-calendar-alt" /> Select Grand Prix</label>
        <select value={selectedRace} onChange={(e) => onRaceChange(parseInt(e.target.value, 10))}>
          {races.map((r) => (
            <option key={r.id} value={r.id} disabled={r.status !== 'upcoming'}>
              {r.flag} {r.name} {r.status === 'completed' ? '(done)' : r.status === 'locked' ? '(locked)' : ''}
            </option>
          ))}
        </select>
      </div>
      {currentRace && (
        <div className="race-meta">
          <span><i className="fas fa-road" /> {currentRace.circuit}</span>
          <span className={`status-badge status-${currentRace.status}`}>{currentRace.status}</span>
        </div>
      )}
      <div className="driver-grid-header">
        <span><i className="fas fa-helmet-safety" /> Choose winner</span>
        <span className="driver-count">{drivers.length} drivers</span>
      </div>
      <div className="driver-grid">
        {drivers.map((d) => (
          <div
            key={d.id}
            className={`driver-option ${selectedDriver === d.id ? 'selected' : ''} ${isLocked ? 'disabled' : ''}`}
            onClick={() => !isLocked && onDriverSelect(d.id)}
          >
            <input type="radio" name="driverPick" checked={selectedDriver === d.id} readOnly />
            <span className="driver-flag">{d.flag}</span>
            <span className="driver-name">{d.name}</span>
            <span className="driver-team">{d.team}</span>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={onSubmit} disabled={loading || isLocked}>
        {loading ? <span className="loading-spinner" /> : <><i className="fas fa-check-circle" /> Submit prediction</>}
      </button>
      <div className="prediction-rules">
        <span><i className="fas fa-clock" /> Deadline: race start</span>
        <span><i className="fas fa-star" style={{ color: '#facc15' }} /> 25 pts correct winner</span>
        <span><i className="fas fa-medal" style={{ color: '#94a3b8' }} /> 10 pts podium</span>
        <span><i className="fas fa-plus-circle" style={{ color: '#22c55e' }} /> 5 pts participation</span>
      </div>
    </div>
  );
}
