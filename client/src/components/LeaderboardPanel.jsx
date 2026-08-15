export default function LeaderboardPanel({ leaderboard, user, onRefresh }) {
  return (
    <div className="card">
      <div className="card-title">
        <i className="fas fa-trophy" /> Fantasy Leaderboard
        <span className="badge-pill">top 10</span>
      </div>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Wins</th>
            <th style={{ textAlign: 'right' }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, idx) => {
            const isCurrentUser = user && entry.user === user.username;
            let rankClass = '';
            if (idx === 0) rankClass = 'rank-1';
            else if (idx === 1) rankClass = 'rank-2';
            else if (idx === 2) rankClass = 'rank-3';
            return (
              <tr key={entry.user}>
                <td><span className={`rank-badge ${rankClass}`}>{idx + 1}</span></td>
                <td>{entry.displayName || entry.user} {isCurrentUser ? '⭐' : ''}</td>
                <td>{entry.correctWinners || 0}</td>
                <td style={{ textAlign: 'right' }}><span className="points-badge">{entry.points}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="leaderboard-footer">
        <button className="btn-secondary" onClick={onRefresh}><i className="fas fa-sync-alt" /> refresh</button>
      </div>
    </div>
  );
}
