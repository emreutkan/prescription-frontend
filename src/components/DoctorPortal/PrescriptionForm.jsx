// src/components/DoctorPortal/PrescriptionForm.jsx

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import apiFetch from '../../api/apiFetch';

const PrescriptionForm = ({ token }) => {
    const [phase, setPhase] = useState('tcLookup'); // 'tcLookup' or 'addMedicines'
    const [tcId, setTcId] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Debounce function to limit API calls
    const debounce = (func, delay) => {
        let debounceTimer;
        return function(...args) {
            const context = this;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // Function to handle medicine search
    const handleSearchMedicine = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setErrorMessage('');

        try {
            const response = await apiFetch(
                `/medicine/search?query=${encodeURIComponent(query)}`,
                'GET',
                null,
                null // No token required for medicine search
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

    // Debounced version of the search function
    const debouncedSearch = debounce(handleSearchMedicine, 500);

    // Function to add medicine to the prescription list
    const addMedicine = (medicineName) => {
        // Prevent adding duplicate medicines
        if (medicines.some(med => med.name.toLowerCase() === medicineName.toLowerCase())) {
            setErrorMessage('Medicine already added.');
            return;
        }

        setMedicines([...medicines, { name: medicineName, dosage: 1, quantity: 1 }]);
        setSearchResults([]);
        setSearchQuery('');
        setErrorMessage('');
    };

    // Function to remove medicine from the prescription list
    const removeMedicine = (index) => {
        const newMedicines = medicines.filter((_, i) => i !== index);
        setMedicines(newMedicines);
    };

    // Function to handle prescription submission
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
                `/doctor/prescriptions`,
                'POST',
                { tcId, medicines },
                token
            );
            setSuccessMessage('Prescription created successfully.');
            // Reset the form after successful submission
            resetForm();
        } catch (error) {
            setErrorMessage('Prescription creation failed: ' + error.message);
        }
    };

    // Function to reset the form to initial state
    const resetForm = () => {
        setPhase('tcLookup');
        setTcId('');
        setMedicines([]);
        setSearchQuery('');
        setSearchResults([]);
        setErrorMessage('');
        // Optionally, set a temporary success message before reverting
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000); // Clear success message after 3 seconds
    };

    return (
        <div className="prescription-form-container">
            <form onSubmit={handleSubmitPrescription} className="prescription-form">
                <h2 className="form-title">Create New Prescription</h2>

                {/* Error and Success Messages */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {/* Phase: TC Lookup */}
                {phase === 'tcLookup' && (
                    <>
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
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    if (tcId.trim()) {
                                        setPhase('addMedicines');
                                    } else {
                                        setErrorMessage('Please enter a TC Number.');
                                    }
                                }}
                                className="btn btn-primary"
                            >
                                Proceed
                            </button>
                        </div>
                    </>
                )}

                {/* Phase: Add Medicines */}
                {phase === 'addMedicines' && (
                    <>
                        <div className="form-group">
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
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn btn-reset"
                                title="Start Over"
                            >
                                <X />
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

                        <div className="form-actions">
                            <button
                                type="submit"
                                disabled={medicines.length === 0}
                                className={`btn btn-submit ${medicines.length === 0 ? 'btn-disabled' : ''}`}
                            >
                                Create Prescription
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );

};

export default PrescriptionForm;
