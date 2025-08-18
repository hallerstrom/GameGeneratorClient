import React, { useState, useRef } from 'react';
import './App.css';
import { jsPDF } from 'jspdf';

function App() {
  const [numTeams, setNumTeams] = useState('');
  const [teamNames, setTeamNames] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');

  const scheduleRef = useRef(null);

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

  const handleGenerateSchedule = () => {
    setError('');
    setSchedule(null);

    const teams = teamNames.filter(name => name.trim() !== '');

    if (teams.length < 2) {
      setError('Minst två lag måste anges.');
      return;
    }

    // Nu anropas den lokala funktionen direkt
    const simulatedSchedule = generateSimulatedSchedule(teams);
    setSchedule(simulatedSchedule);
  };

  const generateSimulatedSchedule = (teams) => {
    let tempTeams = [...teams];
    const rounds = [];
    if (tempTeams.length % 2 !== 0) {
      tempTeams.push(null);
    }
    const numRounds = tempTeams.length - 1;
    const half = tempTeams.length / 2;

    for (let round = 0; round < numRounds; round++) {
      const currentRound = [];
      for (let i = 0; i < half; i++) {
        const homeTeam = tempTeams[i];
        const awayTeam = tempTeams[tempTeams.length - 1 - i];
        if (homeTeam && awayTeam) {
          currentRound.push({ homeTeam: homeTeam, awayTeam: awayTeam });
        }
      }
      rounds.push(currentRound);
      
      const last = tempTeams.pop();
      tempTeams.splice(1, 0, last);
    }
    return rounds;
  };
  
  const handleSavePdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(22);
    doc.text('Spelschema', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    doc.setFontSize(12);
    
    schedule.forEach((round, index) => {
      if (yPos > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFontSize(16);
      doc.text(`Omgång ${index + 1}`, margin, yPos);
      yPos += 10;
      doc.setFontSize(12);

      round.forEach(match => {
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(`${match.homeTeam} vs ${match.awayTeam}`, margin + 5, yPos);
        yPos += 10;
      });
      yPos += 5;
    });

    doc.save('spelschema.pdf');
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
          <div className="schedule-section">
            <div className="schedule-container" ref={scheduleRef}>
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
            
            <button className="save-pdf-button" onClick={handleSavePdf}>Spara som PDF</button>
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