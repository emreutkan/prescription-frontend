import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import apiFetch from '../../api/apiFetch';

const LoginForm = ({ setView, setToken }) => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handlePharmacyLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const response = await apiFetch(
                `/pharmacy/auth/login`,
                'POST',
                {
                    email: loginEmail,
                    password: loginPassword
                }
            );
            setToken(response.token);
            setView('manage');
        } catch (error) {
            setErrorMessage('Login failed: ' + error.message);
        }
    };

    return (
        <form onSubmit={handlePharmacyLogin} className="auth-form">
            <h2 className="form-title">Pharmacy Login</h2>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            <div className="form-group">
                <input
                    className="form-input"
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
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
