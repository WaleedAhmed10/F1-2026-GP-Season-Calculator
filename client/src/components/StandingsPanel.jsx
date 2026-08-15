export default function StandingsPanel({ driverStandings, constructorStandings }) {
  return (
    <div className="standings-grid">
      <div className="card">
        <div className="card-title"><i className="fas fa-user" /> Driver Championship</div>
        <table className="leaderboard-table">
          <thead>
            <tr><th>#</th><th>Driver</th><th>Team</th><th>W</th><th>Pts</th></tr>
          </thead>
          <tbody>
            {driverStandings.slice(0, 10).map((d, idx) => (
              <tr key={d.driverId}>
                <td><span className={`rank-badge ${idx < 3 ? `rank-${idx + 1}` : ''}`}>{idx + 1}</span></td>
                <td>{d.flag} {d.code}</td>
                <td className="team-cell">{d.team}</td>
                <td>{d.wins}</td>
                <td><span className="points-badge">{d.points}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="card-title"><i className="fas fa-industry" /> Constructor Championship</div>
        <table className="leaderboard-table">
          <thead>
            <tr><th>#</th><th>Team</th><th>W</th><th>Pts</th></tr>
          </thead>
          <tbody>
            {constructorStandings.slice(0, 10).map((c, idx) => (
              <tr key={c.team}>
                <td><span className={`rank-badge ${idx < 3 ? `rank-${idx + 1}` : ''}`}>{idx + 1}</span></td>
                <td>{c.team}</td>
                <td>{c.wins}</td>
                <td><span className="points-badge">{c.points}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
