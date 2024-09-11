import React, { useState, useRef, useEffect } from 'react';
import { ButtonData } from '../types';

interface ButtonProps extends ButtonData {
  onUpdate: (id: number, newName: string) => void;
  onDelete: (id: number) => void;
}

const Button: React.FC<ButtonProps> = ({ id, name, width, height, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete(id);
    setShowMenu(false);
  };

  const handleSave = () => {
    onUpdate(id, editedName);
    setIsEditing(false);
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
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSave}
            autoFocus
          />
        ) : (
          name
        )}
      </button>
      {showMenu && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPosition.y,
            left: menuPosition.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '5px',
            zIndex: 1000,
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