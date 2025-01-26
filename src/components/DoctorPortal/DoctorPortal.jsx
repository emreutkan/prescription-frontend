// src/components/DoctorPortal/DoctorPortal.js

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import PrescriptionForm from './PrescriptionForm';
import BackButton from '../Common/BackButton';

const DoctorPortal = ({ token, setToken, setActivePortal }) => {
    const [view, setView] = useState(token ? 'createPrescription' : 'login');

    const handleLogout = () => {
        setToken(null);
        setView('login');
    };

    return (
        <div className="doctor-portal">
            <BackButton onClick={() => setActivePortal(null)} />
            <div className="container">
                {!token ? (
                    view === 'login' ? (
                        <LoginForm setView={setView} setToken={setToken} />
                    ) : (
                        <RegisterForm setView={setView} />
                    )
                ) : (
                    <PrescriptionForm token={token} />
                )}
            </div>
        </div>
    );
};

export default DoctorPortal;
