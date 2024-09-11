import React, { useState, useRef, useEffect } from 'react';
import { ButtonData } from '../types';

interface ButtonProps extends ButtonData {
  onUpdate: (id: number, newName: string) => Promise<void>;
  onDelete: (id: number) => void;
}

const Button: React.FC<ButtonProps> = ({ id, name, width, height, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
    setError(null);
  };

  const handleDelete = () => {
    onDelete(id);
    setShowMenu(false);
  };

  const handleSave = async () => {
    try {
      await onUpdate(id, editedName);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError('Failed to update button. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        className="custom-button"
        style={{ width: `${width}px`, height: `${height}px` }}
        onContextMenu={handleContextMenu}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          name
        )}
      </button>
      {error && <div className="error-message">{error}</div>}
      {showMenu && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{
            top: menuPosition.y,
            left: menuPosition.x,
          }}
        >
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default Button;