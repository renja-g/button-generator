import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Button from './components/Button';
import { ButtonData } from './types';

// Structure of an Axios error
interface AxiosError<T = any> extends Error {
  config: any;
  code?: string;
  request?: any;
  response?: {
    data: T;
    status: number;
    headers: any;
  };
  isAxiosError: boolean;
}

// Type guard function to check if an error is an AxiosError
function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}

const App: React.FC = () => {
  const [buttons, setButtons] = useState<ButtonData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newButtonName, setNewButtonName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async (): Promise<void> => {
    try {
      const response = await axios.get<ButtonData[]>('http://localhost:3001/buttons');
      setButtons(response.data);
    } catch (error) {
      console.error('Error fetching buttons:', error);
      setError('Failed to fetch buttons. Please try again later.');
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
      setError('Failed to search buttons. Please try again.');
    }
  };

  const handleAddButton = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post<ButtonData>('http://localhost:3001/buttons', { name: newButtonName });
      setButtons([...buttons, response.data]);
      setNewButtonName('');
    } catch (error) {
      console.error('Error adding button:', error);
      if (isAxiosError(error) && error.response?.status === 409) {
        setError(`A button with the name "${newButtonName}" already exists.`);
      } else {
        setError('Failed to add button. Please try again.');
      }
    }
  };

  const handleUpdateButton = async (id: number, newName: string): Promise<void> => {
    setError(null);
    try {
      const response = await axios.put<ButtonData>(`http://localhost:3001/buttons/${id}`, { name: newName });
      setButtons(buttons.map(button => button.id === id ? response.data : button));
    } catch (error) {
      console.error('Error updating button:', error);
      if (isAxiosError(error) && error.response?.status === 409) {
        setError(`A button with the name "${newName}" already exists.`);
      } else {
        setError('Failed to update button. Please try again.');
      }
    }
  };

  const handleDeleteButton = async (id: number): Promise<void> => {
    setError(null);
    try {
      await axios.delete(`http://localhost:3001/buttons/${id}`);
      setButtons(buttons.filter(button => button.id !== id));
    } catch (error) {
      console.error('Error deleting button:', error);
      setError('Failed to delete button. Please try again.');
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
        {error && <div className="error-message">{error}</div>}
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