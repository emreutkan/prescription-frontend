import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import apiFetch from '../../api/apiFetch';

const RegisterForm = ({ setView }) => {
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handlePharmacyRegister = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await apiFetch(
                `/pharmacy/auth/register`,
                'POST',
                {
                    email: regEmail,
                    password: regPassword,
                    name: regName
                }
            );
            setSuccessMessage('Registration successful. Please log in.');
            setView('login');
        } catch (error) {
            setErrorMessage('Registration failed: ' + error.message);
        }
    };

    return (
        <form onSubmit={handlePharmacyRegister} className="auth-form">
            <h2 className="form-title">Pharmacy Registration</h2>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
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
                    type="text"
                    placeholder="Pharmacy Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
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
