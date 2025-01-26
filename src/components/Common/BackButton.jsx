// src/components/Common/BackButton.js

import React from 'react';

const BackButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="btn btn-back"
        >
            ← Back to Portals
        </button>
    );
};

export default BackButton;
