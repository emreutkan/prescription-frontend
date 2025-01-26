// src/components/PortalSelection/PortalSelection.js

import React from 'react';
import { ChevronRight } from 'lucide-react';

const PortalSelection = ({ onSelectPortal }) => {
    return (
        <div className="portal-selection">
            <button
                onClick={() => onSelectPortal('doctor')}
                className="portal-button doctor-button"
            >
                Doctor Portal <ChevronRight className="icon-right" />
            </button>
            <button
                onClick={() => onSelectPortal('pharmacy')}
                className="portal-button pharmacy-button"
            >
                Pharmacy Portal <ChevronRight className="icon-right" />
            </button>
        </div>
    );
};

export default PortalSelection;
