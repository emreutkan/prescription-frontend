// src/components/PharmacyPortal/PharmacyPortal.js

import React, { useState } from 'react';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';
import PrescriptionManagement from './PrescriptionManagement.jsx';
import BackButton from '../Common/BackButton.jsx';

const PharmacyPortal = ({ token, setToken, setActivePortal }) => {
    const [view, setView] = useState(token ? 'manage' : 'login');
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogout = () => {
        setToken(null);
        setView('login');
    };

    return (
        <div className="pharmacy-portal">
            <BackButton onClick={() => setActivePortal(null)} />
            <div className="container">
                {!token ? (
                    view === 'login' ? (
                        <LoginForm setView={setView} setToken={setToken} />
                    ) : (
                        <RegisterForm setView={setView} />
                    )
                ) : (
                    <PrescriptionManagement token={token} />
                )}
            </div>
        </div>
    );
};

export default PharmacyPortal;
