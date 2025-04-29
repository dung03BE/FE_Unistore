import { style } from '@mui/system';
import React from 'react';

const Input = ({ value, onChange, placeholder, className }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`border p-2 rounded ${className}`} style={{ height: "40px", marginTop: "-10px" }}
        />
    );
};

export { Input };
