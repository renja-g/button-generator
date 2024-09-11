import React from 'react';
import { ButtonData } from '../types';

interface ButtonProps extends ButtonData {}

const Button: React.FC<ButtonProps> = ({ name, width, height }) => {
  return (
    <button
      className="custom-button"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {name}
    </button>
  );
};

export default Button;