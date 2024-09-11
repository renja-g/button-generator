import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Button from './components/Button';
import { ButtonData } from './types';

const App: React.FC = () => {
  const [buttons, setButtons] = useState<ButtonData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newButtonName, setNewButtonName] = useState<string>('');

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async (): Promise<void> => {
    try {
      const response = await axios.get<ButtonData[]>('http://localhost:3001/buttons');
      setButtons(response.data);
    } catch (error) {
      console.error('Error fetching buttons:', error);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const value = e.target.value;
    setSearchTerm(value);
    try {
      const response = await axios.get<ButtonData[]>(`http://localhost:3001/buttons?filter=${value}`);
      setButtons(response.data);
    } catch (error) {
      console.error('Error searching buttons:', error);
    }
  };

  const handleAddButton = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await axios.post<ButtonData>('http://localhost:3001/buttons', { name: newButtonName });
      setButtons([...buttons, response.data]);
      setNewButtonName('');
    } catch (error) {
      console.error('Error adding button:', error);
    }
  };

  const handleUpdateButton = async (id: number, newName: string): Promise<void> => {
    try {
      const response = await axios.put<ButtonData>(`http://localhost:3001/buttons/${id}`, { name: newName });
      setButtons(buttons.map(button => button.id === id ? response.data : button));
    } catch (error) {
      console.error('Error updating button:', error);
    }
  };

  const handleDeleteButton = async (id: number): Promise<void> => {
    try {
      await axios.delete(`http://localhost:3001/buttons/${id}`);
      setButtons(buttons.filter(button => button.id !== id));
    } catch (error) {
      console.error('Error deleting button:', error);
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
        <form onSubmit={handleAddButton} className="add-button-form">
          <input
            type="text"
            placeholder="New button name"
            value={newButtonName}
            onChange={(e) => setNewButtonName(e.target.value)}
            className="add-button-input"
          />
          <button type="submit" className="add-button-submit">Add Button</button>
        </form>
        <div className="button-container">
          {buttons.map((button) => (
            <Button
              key={button.id}
              {...button}
              onUpdate={handleUpdateButton}
              onDelete={handleDeleteButton}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;