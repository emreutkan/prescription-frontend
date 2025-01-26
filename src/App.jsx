// src/App.js

import React, { useState } from 'react';
import PortalSelection from './components/PortalSelection/PortalSelection.jsx';
import DoctorPortal from './components/DoctorPortal/DoctorPortal.jsx';
import PharmacyPortal from './components/PharmacyPortal/PharmacyPortal.jsx';
import './App.css'; // Import the CSS file

const App = () => {
    const [activePortal, setActivePortal] = useState(null);
    const [doctorToken, setDoctorToken] = useState(null);
    const [pharmacyToken, setPharmacyToken] = useState(null);

    const renderContent = () => {
        if (!activePortal) {
            return <PortalSelection onSelectPortal={setActivePortal} />;
        }

        return activePortal === 'doctor'
            ? <DoctorPortal token={doctorToken} setToken={setDoctorToken} setActivePortal={setActivePortal} />
            : <PharmacyPortal token={pharmacyToken} setToken={setPharmacyToken} setActivePortal={setActivePortal} />;
    };

    return (
        <div className="app-container">
            <div className="content-area">
                {renderContent()}
            </div>
        </div>
    );
};

export default App;
