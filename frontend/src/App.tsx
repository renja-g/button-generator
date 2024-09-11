import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Button from './components/Button';
import { ButtonData } from './types';

const App: React.FC = () => {
  const [buttons, setButtons] = useState<ButtonData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async (): Promise<void> => {
    try {
      const response = await axios.get<ButtonData[]>('http://localhost:8000/buttons');
      setButtons(response.data);
    } catch (error) {
      console.error('Error fetching buttons:', error);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const value = e.target.value;
    setSearchTerm(value);
    try {
      const response = await axios.get<ButtonData[]>(`http://localhost:8000/buttons?query=${value}`);
      setButtons(response.data);
    } catch (error) {
      console.error('Error searching buttons:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Button Dashboard</h1>
      </header>
      <main className="App-main">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search buttons..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <div className="button-container">
          {buttons.map((button) => (
            <Button key={button.id} {...button} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;