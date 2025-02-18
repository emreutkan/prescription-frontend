// src/components/DoctorPortal/LoginForm.js

import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import apiFetch from '../../api/apiFetch';

const LoginForm = ({ setView, setToken }) => {
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleDoctorLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const response = await apiFetch(
                `/doctor/auth/login`,
                'POST',
                { username: loginUsername, password: loginPassword, role: 'doctor' }
            );
            setToken(response.token);
            setView('createPrescription');
        } catch (error) {
            setErrorMessage('Login failed: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleDoctorLogin} className="auth-form">
            <h2 className="form-title">Doctor Login</h2>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            <div className="form-group">
                <input
                    className="form-input"
                    type="text"
                    placeholder="Username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <input
                    className="form-input"
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                />
            </div>
            <div className="form-actions">
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    <LogIn className="icon-left" /> Login
                </button>
                <button
                    type="button"
                    onClick={() => setView('register')}
                    className="btn btn-link"
                >
                    Register
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
