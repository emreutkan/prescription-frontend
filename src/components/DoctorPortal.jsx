// src/components/DoctorPortal.js

import  { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import {API_BASE_URL, apiFetch} from '../api/apiFetch.js';

const DoctorPortal = ({ token, setToken, setActivePortal }) => {
    const [view, setView] = useState(token ? 'createPrescription' : 'login');
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [tcId, setTcId] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Handle Doctor Login
    const handleDoctorLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const response = await apiFetch(
                `${API_BASE_URL}/doctor/auth/login`,
                'POST',
                { username: loginUsername, password: loginPassword }
            );
            setToken(response.token);
            setView('createPrescription');
        } catch (error) {
            setErrorMessage('Login failed: ' + error.message);
        }
    };

    // Handle Doctor Registration
    const handleDoctorRegister = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await apiFetch(
                `${API_BASE_URL}/doctor/auth/register`,
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

    // Handle Prescription Submission
    const handleSubmitPrescription = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!tcId.trim()) {
            setErrorMessage('Please enter a valid TC Number.');
            return;
        }

        if (medicines.length === 0) {
            setErrorMessage('Please add at least one medicine to the prescription.');
            return;
        }

        try {
            const response = await apiFetch(
                `${API_BASE_URL}/doctor/doctors/prescriptions`,
                'POST',
                { tcId, medicines },
                token
            );
            setSuccessMessage('Prescription created successfully.');
            // Reset the form
            setTcId('');
            setMedicines([]);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            setErrorMessage('Prescription creation failed: ' + error.message);
        }
    };

    // Handle Medicine Search with Autocomplete
    const handleSearchMedicine = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            const response = await apiFetch(
                `${API_BASE_URL}/medicine/search?query=${encodeURIComponent(query)}`,
                'GET',
                null,
                token
            );

            // Assuming response has 'medicationNames' array
            const results = response.medicationNames.slice(0, 20); // Limit to 20 results
            setSearchResults(results);
        } catch (error) {
            setErrorMessage('Search failed: ' + error.message);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle Adding Medicine to List
    const addMedicine = (medicineString) => {
        // Parse the medicine string to extract name and dosage
        const firstSpaceIndex = medicineString.indexOf(' ');
        if (firstSpaceIndex === -1) {
            setErrorMessage('Invalid medicine format.');
            return;
        }

        const name = medicineString.substring(0, firstSpaceIndex);
        const dosage = medicineString.substring(firstSpaceIndex + 1);

        setMedicines([...medicines, { name, dosage, quantity: 1 }]);
        setSearchResults([]);
        setSearchQuery('');
    };

    // Handle Removing Medicine from List
    const removeMedicine = (index) => {
        const newMedicines = medicines.filter((_, i) => i !== index);
        setMedicines(newMedicines);
    };

    // Debounce the search input to prevent excessive API calls
    const debounce = (func, delay) => {
        let debounceTimer;
        return function(...args) {
            const context = this;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const debouncedSearch = debounce(handleSearchMedicine, 500);

    // Render Doctor Login and Registration Forms
    const renderDoctorAuth = () => (
        <div className="auth-form-container">
            {view === 'login' && (
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
            )}

            {view === 'register' && (
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
            )}
        </div>
    );

    // Render Prescription Creation Interface
    const renderDoctorMain = () => (
        <div className="main-content">
            <form onSubmit={handleSubmitPrescription} className="prescription-form">
                <h2 className="form-title">Create New Prescription</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Patient TC Number"
                        value={tcId}
                        onChange={(e) => setTcId(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Search Medicine"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            debouncedSearch(e.target.value);
                        }}
                        className="form-input search-input"
                    />
                    <button
                        type="button"
                        onClick={() => handleSearchMedicine(searchQuery)}
                        className="btn btn-search"
                    >
                        <Search className="icon-left" /> Search
                    </button>
                </div>

                {isSearching && <div className="loading">Searching...</div>}

                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((medicine, index) => (
                            <div
                                key={index}
                                onClick={() => addMedicine(medicine)}
                                className="search-result-item"
                            >
                                {medicine}
                            </div>
                        ))}
                    </div>
                )}

                <div className="medicines-list">
                    <h3 className="list-title">Prescription Medicines:</h3>
                    {medicines.length === 0 && <p className="no-medicines">No medicines added yet.</p>}
                    {medicines.map((medicine, index) => (
                        <div key={index} className="medicine-item">
                            <span className="medicine-name">{medicine.name} - {medicine.dosage}</span>
                            <input
                                type="number"
                                min="1"
                                value={medicine.quantity}
                                onChange={(e) => {
                                    const newMedicines = [...medicines];
                                    newMedicines[index].quantity = parseInt(e.target.value) || 1;
                                    setMedicines(newMedicines);
                                }}
                                className="medicine-quantity"
                            />
                            <button
                                type="button"
                                onClick={() => removeMedicine(index)}
                                className="btn btn-remove"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={medicines.length === 0}
                    className={`btn btn-submit ${medicines.length === 0 ? 'btn-disabled' : ''}`}
                >
                    Create Prescription
                </button>
            </form>
        </div>
    );

    // Render Doctor Authentication Interface or Prescription Creation Interface
    const renderDoctorContent = () => (
        <div className="container">
            {!token ? renderDoctorAuth() : renderDoctorMain()}
        </div>
    );

    return (
        <div className="doctor-portal">
            <button
                onClick={() => setActivePortal(null)}
                className="btn btn-back"
            >
                ← Back to Portals
            </button>
            {renderDoctorContent()}
        </div>
    );
};

export default DoctorPortal;
