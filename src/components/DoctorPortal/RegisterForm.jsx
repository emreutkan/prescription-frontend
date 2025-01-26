// src/components/DoctorPortal/RegisterForm.js

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import apiFetch from '../../api/apiFetch';

const RegisterForm = ({ setView }) => {
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleDoctorRegister = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await apiFetch(
                `/doctor/auth/register`,
                'POST',
                {
                    username: regUsername,
                    email: regEmail,
                    password: regPassword
                }
            );
            setSuccessMessage('Registration successful. Please log in.');
            setView('login');
        } catch (error) {
            setErrorMessage('Registration failed: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleDoctorRegister} className="auth-form">
            <h2 className="form-title">Doctor Registration</h2>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            <div className="form-group">
                <input
                    className="form-input"
                    type="text"
                    placeholder="Username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <input
                    className="form-input"
                    type="email"
                    placeholder="Email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <input
                    className="form-input"
                    type="password"
                    placeholder="Password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                />
            </div>
            <div className="form-actions">
                <button
                    type="submit"
                    className="btn btn-success"
                >
                    <UserPlus className="icon-left" /> Register
                </button>
                <button
                    type="button"
                    onClick={() => setView('login')}
                    className="btn btn-link"
                >
                    Back to Login
                </button>
            </div>
        </form>
    );
};

export default RegisterForm;
