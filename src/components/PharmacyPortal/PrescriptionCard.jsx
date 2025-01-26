// src/components/PharmacyPortal/PrescriptionCard.jsx

import React from 'react';
import { ChevronRight } from 'lucide-react';

const PrescriptionCard = ({ prescription, onSelect }) => {
    const { id, tcId, status, medicines, createdAt, updatedAt } = prescription;

    return (
        <div className="prescription-card">
            <div className="prescription-header">
                <div>
                    <span className="info-label">TC ID:</span>
                    <span className="info-value">{tcId}</span>
                </div>
                <div>
                    <span className="info-label">Status:</span>
                    <span className={`status ${status.toLowerCase()}`}>
                        {status}
                    </span>
                </div>
                <button
                    onClick={() => onSelect(prescription)}
                    className="btn btn-select"
                    title="Select Prescription"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
            <div className="prescription-details">
                <div className="prescription-info">
                    <span className="info-label">Created At:</span>
                    <span className="info-value">{new Date(createdAt).toLocaleString()}</span>
                </div>
                <div className="prescription-info">
                    <span className="info-label">Updated At:</span>
                    <span className="info-value">{new Date(updatedAt).toLocaleString()}</span>
                </div>
                <div className="medicines-section">
                    <h4 className="section-title">Medicines:</h4>
                    {medicines.map(medicine => (
                        <div key={medicine.id} className="medicine-item">
                            <span>{medicine.name}</span>
                            <span>{medicine.dosage} (Qty: {medicine.quantity})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrescriptionCard;
