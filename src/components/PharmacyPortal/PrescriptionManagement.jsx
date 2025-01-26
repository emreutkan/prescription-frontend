// src/components/PharmacyPortal/PrescriptionManagement.js

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import apiFetch from '../../api/apiFetch';
import PrescriptionCard from './PrescriptionCard.jsx';

const PrescriptionManagement = ({ token }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [updateMedicines, setUpdateMedicines] = useState([]);
    const [missingMedicines, setMissingMedicines] = useState([]);
    const [addMedicineQuery, setAddMedicineQuery] = useState('');
    const [addMedicineResults, setAddMedicineResults] = useState([]);
    const [isAddingMedicine, setIsAddingMedicine] = useState(false);

    // Debounce function to limit API calls
    const debounce = (func, delay) => {
        let debounceTimer;
        return function(...args) {
            const context = this;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // Function to handle prescription search
    const handleSearchPrescriptions = async () => {
        if (!searchQuery.trim()) {
            setErrorMessage('Please enter a Patient TC ID to search.');
            setPrescriptions([]);
            setSuccessMessage('');
            return;
        }

        setIsSearching(true);
        setErrorMessage('');
        setSuccessMessage('');
        setSelectedPrescription(null); // Reset any selected prescription

        try {
            const results = await apiFetch(
                `/pharmacy/prescriptions/search/${encodeURIComponent(searchQuery)}`,
                'GET',
                null,
                token
            );

            // Map '_id' to 'id' for consistency
            const mappedPrescriptions = results.map(prescription => ({
                ...prescription,
                id: prescription._id, // Add 'id' property
            }));

            setPrescriptions(mappedPrescriptions);
            if (mappedPrescriptions.length === 0) {
                setSuccessMessage('No prescriptions found.');
            }
        } catch (error) {
            setErrorMessage('Search failed: ' + error.message);
            setPrescriptions([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced version of the medicine addition search
    const debouncedAddMedicineSearch = debounce(handleAddMedicineSearch, 500);

    // Function to handle adding medicine search
    async function handleAddMedicineSearch(query) {
        if (!query.trim()) {
            setAddMedicineResults([]);
            return;
        }

        setIsAddingMedicine(true);
        setErrorMessage('');

        try {
            const response = await apiFetch(
                `/medicine/search?query=${encodeURIComponent(query)}`,
                'GET',
                null,
                null // No token required for medicine search
            );

            const results = response.medicationNames.slice(0, 20); // Limit to 20 results
            setAddMedicineResults(results);
        } catch (error) {
            setErrorMessage('Medicine search failed: ' + error.message);
            setAddMedicineResults([]);
        } finally {
            setIsAddingMedicine(false);
        }
    }

    // Function to handle selecting a prescription
    const handleSelectPrescription = (prescription) => {
        setSelectedPrescription(prescription);
        // Initialize updateMedicines with existing medicines, adding a 'status' field
        const initialMedicines = prescription.medicines.map(med => ({
            ...med,
            quantity: med.quantity,
            status: 'Given' // Default status
        }));
        setUpdateMedicines(initialMedicines);
        setMissingMedicines(prescription.missingMedicines || []);
    };

    // Function to add a medicine to the updateMedicines list
    const addMedicineToUpdate = (medicineString) => {
        const firstSpaceIndex = medicineString.indexOf(' ');
        if (firstSpaceIndex === -1) {
            setErrorMessage('Invalid medicine format.');
            return;
        }

        const name = medicineString.substring(0, firstSpaceIndex);
        const dosage = medicineString.substring(firstSpaceIndex + 1);

        // Prevent adding duplicate medicines
        if (updateMedicines.some(med => med.name === name && med.dosage === dosage)) {
            setErrorMessage('Medicine already added.');
            return;
        }

        setUpdateMedicines([...updateMedicines, { name, dosage, quantity: 1, status: 'Given' }]);
        setAddMedicineResults([]);
        setAddMedicineQuery('');
        setErrorMessage('');
    };

    // Function to remove a medicine from the updateMedicines list
    const removeMedicineFromUpdate = (index) => {
        const newMedicines = updateMedicines.filter((_, i) => i !== index);
        setUpdateMedicines(newMedicines);
    };

    // Function to toggle medicine status between Given and Missing
    const toggleMedicineStatus = (index) => {
        const newMedicines = [...updateMedicines];
        newMedicines[index].status = newMedicines[index].status === 'Given' ? 'Missing' : 'Given';
        setUpdateMedicines(newMedicines);
    };

    // Function to handle submitting the updated prescription as Incomplete
    const handleSubmitIncomplete = async () => {
        if (!selectedPrescription) {
            setErrorMessage('No prescription selected.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');

        // Prepare the request body
        const body = {
            medicines: updateMedicines
                .filter(med => med.status === 'Given')
                .map(med => ({
                    name: med.name,
                    quantity: med.quantity
                })),
            missingMedicines: updateMedicines
                .filter(med => med.status === 'Missing')
                .map(med => ({
                    name: med.name
                }))
        };

        try {
            await apiFetch(
                `/pharmacy/prescriptions/${encodeURIComponent(selectedPrescription.id)}`,
                'PATCH',
                body,
                token
            );
            setSuccessMessage('Prescription updated as Incomplete.');
            // Refresh the prescriptions list
            handleSearchPrescriptions();
            // Reset selection
            setSelectedPrescription(null);
            setUpdateMedicines([]);
            setMissingMedicines([]);
        } catch (error) {
            setErrorMessage('Failed to update prescription: ' + error.message);
        }
    };

    // Function to handle completing the prescription
    const handleCompletePrescription = async () => {
        if (!selectedPrescription) {
            setErrorMessage('No prescription selected.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');

        try {
            await apiFetch(
                `/pharmacy/prescriptions/${encodeURIComponent(selectedPrescription.id)}/complete`,
                'PATCH',
                null, // No body required for complete endpoint
                token
            );
            setSuccessMessage('Prescription marked as Complete.');
            // Refresh the prescriptions list
            handleSearchPrescriptions();
            // Reset selection
            setSelectedPrescription(null);
            setUpdateMedicines([]);
            setMissingMedicines([]);
        } catch (error) {
            setErrorMessage('Failed to complete prescription: ' + error.message);
        }
    };

    // Function to reset the selected prescription
    const resetSelectedPrescription = () => {
        setSelectedPrescription(null);
        setUpdateMedicines([]);
        setMissingMedicines([]);
        setAddMedicineQuery('');
        setAddMedicineResults([]);
        setErrorMessage('');
        setSuccessMessage('');
    };

    return (
        <div className="main-content">
            <div className="header">
                <h2 className="header-title">Prescription Management</h2>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search by Patient TC ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input search-input"
                />
                <button
                    onClick={handleSearchPrescriptions}
                    className="btn btn-search"
                >
                    <Search className="icon-left" /> Search
                </button>
            </div>

            {/* Loading Indicator */}
            {isSearching && <div className="loading">Searching...</div>}

            {/* Success and Error Messages */}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {/* Prescriptions List */}
            {!selectedPrescription && prescriptions.length > 0 && (
                <div className="prescriptions-list">
                    {prescriptions.map(prescription => (
                        <PrescriptionCard
                            key={prescription.id} // Now uses 'id'
                            prescription={prescription}
                            onSelect={handleSelectPrescription}
                        />
                    ))}
                </div>
            )}

            {/* Selected Prescription Details and Actions */}
            {selectedPrescription && (
                <div className="selected-prescription">
                    <div className="selected-prescription-header">
                        <h3>Prescription Details</h3>
                        <button
                            onClick={resetSelectedPrescription}
                            className="btn btn-reset-selection"
                            title="Reset Selection"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="prescription-info">
                        <span className="info-label">Prescription ID:</span>
                        <span className="info-value">{selectedPrescription.id}</span>
                    </div>
                    <div className="prescription-info">
                        <span className="info-label">Patient TC ID:</span>
                        <span className="info-value">{selectedPrescription.tcId}</span>
                    </div>

                    {/* Medicines to Update */}
                    <div className="update-medicines-section">
                        <h4>Add More Medicines</h4>
                        <div className="add-medicine-form">
                            <input
                                type="text"
                                placeholder="Search Medicine to Add"
                                value={addMedicineQuery}
                                onChange={(e) => {
                                    setAddMedicineQuery(e.target.value);
                                    debouncedAddMedicineSearch(e.target.value);
                                }}
                                className="form-input search-input"
                            />
                            <button
                                type="button"
                                onClick={() => handleAddMedicineSearch(addMedicineQuery)}
                                className="btn btn-search"
                            >
                                <Search className="icon-left" /> Search
                            </button>
                        </div>

                        {isAddingMedicine && <div className="loading">Searching...</div>}

                        {addMedicineResults.length > 0 && (
                            <div className="search-results">
                                {addMedicineResults.map((medicine, index) => (
                                    <div
                                        key={index}
                                        onClick={() => addMedicineToUpdate(medicine)}
                                        className="search-result-item"
                                    >
                                        {medicine}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* List of Medicines to be Updated */}
                        <div className="medicines-to-update">
                            <h4>Medicines to Submit:</h4>
                            {updateMedicines.length === 0 && <p>No medicines to submit.</p>}
                            {updateMedicines.map((medicine, index) => (
                                <div key={index} className="medicine-item">
                                    <span className="medicine-name">{medicine.name} - {medicine.dosage}</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={medicine.quantity}
                                        onChange={(e) => {
                                            const newMedicines = [...updateMedicines];
                                            newMedicines[index].quantity = parseInt(e.target.value) || 1;
                                            setUpdateMedicines(newMedicines);
                                        }}
                                        className="medicine-quantity"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMedicineFromUpdate(index)}
                                        className="btn btn-remove"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            onClick={handleSubmitIncomplete}
                            disabled={updateMedicines.length === 0 && missingMedicines.length === 0}
                            className={`btn btn-submit ${updateMedicines.length === 0 && missingMedicines.length === 0 ? 'btn-disabled' : ''}`}
                        >
                            Submit as Incomplete
                        </button>
                        <button
                            onClick={handleCompletePrescription}
                            className="btn btn-complete"
                        >
                            Complete Prescription
                        </button>
                    </div>

                    {/* Current Medicines Status */}
                    <div className="current-medicines">
                        <h4>Current Medicines Status:</h4>
                        {updateMedicines.length === 0 ? (
                            <p>No medicines to display.</p>
                        ) : (
                            <div className="current-medicines-list">
                                {updateMedicines.map((medicine, index) => (
                                    <div key={index} className="medicine-item">
                                        <span className="medicine-name">{medicine.name} - {medicine.dosage}</span>
                                        <span className={`medicine-status ${medicine.status.toLowerCase()}`}>
                                            {medicine.status}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => toggleMedicineStatus(index)}
                                            className="btn btn-toggle-status"
                                        >
                                            Toggle Status
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

};

export default PrescriptionManagement;
