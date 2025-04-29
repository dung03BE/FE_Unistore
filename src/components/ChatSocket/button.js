import React from 'react';

const Button = ({ children, type, onClick, className }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`bg-blue-500 text-white p-2 rounded ${className}`}
        >
            {children}
        </button>
    );
};

export { Button };
