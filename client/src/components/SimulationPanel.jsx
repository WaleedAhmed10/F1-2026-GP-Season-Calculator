export default function SimulationPanel({ simulation }) {
  if (!simulation?.probabilities?.length) {
    return (
      <div className="card">
        <div className="card-title"><i className="fas fa-dice" /> Championship Simulation</div>
        <p className="empty-state">No simulation data yet — add race results to enable Monte Carlo predictions.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <i className="fas fa-dice" /> Monte Carlo Championship Simulation
        <span className="badge-pill">{simulation.iterations?.toLocaleString()} runs</span>
      </div>
      <p className="sim-note">
        {simulation.remainingRaces} races remaining — probability each driver wins the 2026 title
      </p>
      <div className="sim-bars">
        {simulation.probabilities.slice(0, 8).map((entry) => (
          <div key={entry.driverId} className="sim-row">
            <span className="sim-label">{entry.code} — {entry.name}</span>
            <div className="sim-bar-track">
              <div className="sim-bar-fill" style={{ width: `${Math.min(entry.probability, 100)}%` }} />
            </div>
            <span className="sim-pct">{entry.probability}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
