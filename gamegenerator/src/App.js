import React, { useState } from 'react';
import './App.css';

function App() {
  const [numTeams, setNumTeams] = useState('');
  const [teamNames, setTeamNames] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');

  const handleNumTeamsChange = (e) => {
    const count = parseInt(e.target.value);
    setNumTeams(e.target.value);
    
    if (!isNaN(count) && count > 0) {
      setTeamNames(new Array(count).fill(''));
    } else {
      setTeamNames([]);
    }
  };

  const handleTeamNameChange = (e, index) => {
    const newTeamNames = [...teamNames];
    newTeamNames[index] = e.target.value;
    setTeamNames(newTeamNames);
  };

  const handleGenerateSchedule = async () => {
    setError('');
    setSchedule(null);

    const teams = teamNames.filter(name => name.trim() !== '');

    if (teams.length < 2) {
      setError('Minst två lag måste anges.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/schedule/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teams),
      });

      if (!response.ok) {
        throw new Error('Kunde inte generera spelschema.');
      }
      const data = await response.json();
      setSchedule(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Spelschema-generator</h1>
      </header>
      
      <main className="main-content">
        <div className="input-section">
          <div className="input-group centered-input">
            <label htmlFor="numTeams">Antal lag:</label>
            <input
              id="numTeams"
              type="number"
              value={numTeams}
              onChange={handleNumTeamsChange}
              min="2"
            />
          </div>

          {numTeams > 0 && teamNames.length > 0 && (
            <div className="team-names-grid-container">
              <div className="team-names-grid">
                {teamNames.map((name, index) => (
                  <div key={index} className="team-input-group">
                    <label>Lag {index + 1}:</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleTeamNameChange(e, index)}
                      placeholder="T.ex. VSK Fotboll"
                    />
                  </div>
                ))}
              </div>
              <button className="generate-button" onClick={handleGenerateSchedule}>Generera Spelschema</button>
            </div>
          )}
        </div>
        
        {error && <p className="error-message">{error}</p>}

        {schedule && (
          <div className="schedule-container">
            {schedule.map((round, index) => (
              <div key={index} className="round-card">
                <h3>Omgång {index + 1}</h3>
                <ul className="match-list">
                  {round.map((match, matchIndex) => (
                    <li key={matchIndex} className="match-item">
                      <span className="team-name">{match.homeTeam}</span>
                      <span className="vs-text">vs</span>
                      <span className="team-name">{match.awayTeam}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="footer">
        <p>Skapad med React och .NET</p>
      </footer>
    </div>
  );
}

export default App;