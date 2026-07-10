import { useState, useEffect } from 'react';

const mockLeaderboard = [
  { rank: 1, user: 'TraderA', valeur: 82500.75 },
  { rank: 2, user: 'TraderB', valeur: 71200.12 },
  { rank: 3, user: 'TraderC', valeur: 69521.40 }
];

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    setLeaders(mockLeaderboard);
  }, []);

  return (
    <section className="leaderboard">
      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Trader</th>
            <th>Valeur portefeuille</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((item) => (
            <tr key={item.rank}>
              <td>{item.rank}</td>
              <td>{item.user}</td>
              <td>{item.valeur.toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
