// src/components/PharmacyPortal.js

import  { useState } from 'react';
import { LogIn, UserPlus, Search, Check, Edit } from 'lucide-react';
import { apiFetch } from '../api/apiFetch.js';
import './PharmacyPortal.css'; // Optional: Separate CSS for PharmacyPortal

const API_BASE_URL = 'http://localhost:4000';

const PharmacyPortal = ({ token, setToken, setActivePortal }) => {
    const [view, setView] = useState(token ? 'manage' : 'login');
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Additional States for Partial Completion
    const [partialCompletion, setPartialCompletion] = useState({});
    const [showPartialForm, setShowPartialForm] = useState(null);

    // Handle Pharmacy Login
    const handlePharmacyLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const response = await apiFetch(
                `${API_BASE_URL}/pharmacy/auth/login`,
                'POST',
                { username: loginUsername, password: loginPassword }
            );
            setToken(response.token);
            setView('manage');
        } catch (error) {
            setErrorMessage('Login failed: ' + error.message);
        }
    };

    // Handle Pharmacy Registration
    const handlePharmacyRegister = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await apiFetch(
                `${API_BASE_URL}/pharmacy/auth/register`,
                'POST',
                {
                    username: regUsername,
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

    // Search Prescriptions
    const searchPrescriptions = async () => {
        if (!searchQuery.trim()) {
            setErrorMessage('Please enter a Patient TC ID to search.');
            return;
        }

        setIsSearching(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const results = await apiFetch(
                `${API_BASE_URL}/pharmacy/prescriptions/search/${encodeURIComponent(searchQuery)}`,
                'GET',
                null,
                token
            );
            setPrescriptions(results);
        } catch (error) {
            setErrorMessage('Search failed: ' + error.message);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle Mark as Complete
    const handleMarkComplete = async (prescriptionId) => {
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const updatedPrescription = await apiFetch(
                `${API_BASE_URL}/pharmacy/prescriptions/${prescriptionId}/complete`,
                'PATCH',
                {},
                token
            );
            setSuccessMessage('Prescription marked as complete.');
            // Update the prescriptions list
            setPrescriptions(prev =>
                prev.map(p => p.id === prescriptionId ? updatedPrescription : p)
            );
        } catch (error) {
            setErrorMessage('Failed to mark as complete: ' + error.message);
        }
    };

    // Handle Submit Partial Completion
    const handleSubmitPartial = async (prescriptionId) => {
        setErrorMessage('');
        setSuccessMessage('');

        const partialData = partialCompletion[prescriptionId];
        if (!partialData || (!partialData.medicinesDelivered && !partialData.missingMedicines)) {
            setErrorMessage('Please specify delivered and/or missing medicines.');
            return;
        }

        // Parse comma-separated strings into arrays of objects
        const medicinesDelivered = partialData.medicinesDelivered
            ? partialData.medicinesDelivered.split(',').map(item => {
                const [name, dosage] = item.trim().split(' ');
                return { name, dosage };
            })
            : [];

        const missingMedicines = partialData.missingMedicines
            ? partialData.missingMedicines.split(',').map(name => ({ name: name.trim() }))
            : [];

        try {
            const response = await apiFetch(
                `${API_BASE_URL}/pharmacy/prescriptions/${prescriptionId}`,
                'PATCH',
                { medicines: medicinesDelivered, missingMedicines },
                token
            );
            setSuccessMessage('Partial completion submitted successfully.');
            // Update the prescriptions list
            setPrescriptions(prev =>
                prev.map(p => p.id === prescriptionId ? response : p)
            );
            // Reset partial completion form
            setPartialCompletion(prev => ({ ...prev, [prescriptionId]: {} }));
            setShowPartialForm(null);
        } catch (error) {
            setErrorMessage('Failed to submit partial completion: ' + error.message);
        }
    };

    // Handle Input Change for Partial Completion
    const handlePartialInputChange = (prescriptionId, field, value) => {
        setPartialCompletion(prev => ({
            ...prev,
            [prescriptionId]: {
                ...prev[prescriptionId],
                [field]: value
            }
        }));
    };

    // Render Pharmacy Login and Registration Forms
    const renderPharmacyAuth = () => (
        <div className="auth-form-container">
            {view === 'login' && (
                <form onSubmit={handlePharmacyLogin} className="auth-form">
                    <h2 className="form-title">Pharmacy Login</h2>
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
            )}

            {view === 'register' && (
                <form onSubmit={handlePharmacyRegister} className="auth-form">
                    <h2 className="form-title">Pharmacy Registration</h2>
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
            )}
        </div>
    );

    // Render Prescription Management Interface
    const renderPharmacyMain = () => (
        <div className="main-content">
            <div className="header">
                <h2 className="header-title">Prescription Management</h2>
                <button
                    onClick={() => {
                        setToken(null);
                        setActivePortal(null);
                    }}
                    className="btn btn-logout"
                >
                    Logout
                </button>
            </div>

            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search by Patient TC ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input search-input"
                />
                <button
                    onClick={searchPrescriptions}
                    className="btn btn-search"
                >
                    <Search className="icon-left" /> Search
                </button>
            </div>

            {isSearching && <div className="loading">Searching...</div>}

            {prescriptions.length > 0 ? (
                prescriptions.map(prescription => (
                    <div key={prescription.id} className="prescription-card">
                        <div className="prescription-info">
                            <span className="info-label">Patient TC ID:</span>
                            <span className="info-value">{prescription.tcId}</span>
                        </div>
                        <div className="prescription-info">
                            <span className="info-label">Status:</span>
                            <span className={`status ${prescription.status.toLowerCase()}`}>
                                {prescription.status}
                            </span>
                        </div>
                        <div className="medicines-section">
                            <h3 className="section-title">Medicines:</h3>
                            {prescription.medicines.map(medicine => (
                                <div key={medicine.id} className="medicine-item">
                                    <span>{medicine.name}</span>
                                    <span>{medicine.dosage} (Qty: {medicine.quantity})</span>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            {prescription.status !== 'Completed' && (
                                <>
                                    <button
                                        onClick={() => handleMarkComplete(prescription.id)}
                                        className="btn btn-complete"
                                    >
                                        <Check className="icon-left" /> Mark as Complete
                                    </button>
                                    <button
                                        onClick={() => setShowPartialForm(prescription.id)}
                                        className="btn btn-partial"
                                    >
                                        <Edit className="icon-left" /> Submit Partial Completion
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Partial Completion Form */}
                        {showPartialForm === prescription.id && (
                            <div className="partial-form">
                                <h4>Submit Partial Completion</h4>
                                <div className="form-group">
                                    <label>Medicines Delivered (comma-separated):</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Aspirin 500mg, Paracetamol 250mg"
                                        value={partialCompletion[prescription.id]?.medicinesDelivered || ''}
                                        onChange={(e) => handlePartialInputChange(prescription.id, 'medicinesDelivered', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Missing Medicines (comma-separated):</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Voltaren"
                                        value={partialCompletion[prescription.id]?.missingMedicines || ''}
                                        onChange={(e) => handlePartialInputChange(prescription.id, 'missingMedicines', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button
                                        onClick={() => handleSubmitPartial(prescription.id)}
                                        className="btn btn-submit-partial"
                                    >
                                        Submit
                                    </button>
                                    <button
                                        onClick={() => setShowPartialForm(null)}
                                        className="btn btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                !isSearching && <p className="no-prescriptions">No prescriptions found.</p>
            )}

            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
        </div>
    );

    // Render Pharmacy Authentication Interface or Prescription Management Interface
    const renderPharmacyContent = () => (
        <div className="container">
            {!token ? renderPharmacyAuth() : renderPharmacyMain()}
        </div>
    );

    return (
        <div className="pharmacy-portal">
            <button
                onClick={() => setActivePortal(null)}
                className="btn btn-back"
            >
                ← Back to Portals
            </button>
            {renderPharmacyContent()}
        </div>
    );
};

export default PharmacyPortal;
