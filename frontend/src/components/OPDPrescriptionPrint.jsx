import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PrescriptionRenderer from "./PrescriptionRenderer";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OPDPrescriptionPrint = () => {
  const { prescriptionId } = useParams();
  const [printData, setPrintData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrintData();
  }, [prescriptionId]);

  const fetchPrintData = async () => {
    try {
      const response = await axios.get(`${API}/opd-prescriptions/${prescriptionId}/print`);
      setPrintData(response.data);
    } catch (error) {
      console.error("Error fetching prescription print data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (!printData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Prescription not found</h2>
          <p className="mt-2 text-gray-600">The requested prescription could not be loaded.</p>
        </div>
      </div>
    );
  }

  const { prescription, doctor, patient } = printData;
  const age = patient.date_of_birth ? 
    new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button - Hidden during print */}
      <div className="print:hidden fixed top-4 right-4 z-10">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <span>🖨️</span>
          <span>Print Prescription</span>
        </button>
      </div>

      {/* Prescription Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {doctor.clinic_name || "Medical Clinic"}
            </h1>
            <div className="text-lg font-semibold text-blue-600 mb-4">
              OPD PRESCRIPTION
            </div>
          </div>
          
          {/* Doctor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
              <p className="text-gray-600">{doctor.qualification}</p>
              <p className="text-gray-600">{doctor.specialization}</p>
              <p className="text-sm text-gray-500">License: {doctor.license_number}</p>
            </div>
            <div className="text-right">
              {doctor.phone && <p className="text-sm text-gray-600">📞 {doctor.phone}</p>}
              {doctor.email && <p className="text-sm text-gray-600">✉️ {doctor.email}</p>}
              {doctor.clinic_address && (
                <p className="text-sm text-gray-600 mt-2">📍 {doctor.clinic_address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p><strong>Name:</strong> {patient.name}</p>
              {age && <p><strong>Age:</strong> {age} years</p>}
              {patient.gender && <p><strong>Gender:</strong> {patient.gender}</p>}
              {patient.phone && <p><strong>Phone:</strong> {patient.phone}</p>}
            </div>
            <div>
              {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
              {patient.address && <p><strong>Address:</strong> {patient.address}</p>}
              {patient.emergency_contact && (
                <p><strong>Emergency Contact:</strong> {patient.emergency_contact}</p>
              )}
            </div>
          </div>
          
          {patient.medical_history && patient.medical_history !== "None" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p><strong>Medical History:</strong> {patient.medical_history}</p>
            </div>
          )}
        </div>

        {/* Visit Details - Consultation fee hidden */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Visit Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
            <div>
              <p><strong>Date:</strong> {new Date(prescription.date).toLocaleDateString()}</p>
            </div>
            {prescription.next_visit_date && (
              <div>
                <p><strong>Next Visit:</strong> {new Date(prescription.next_visit_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Prescription Area */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Prescription</h3>
          <div className="border-2 border-gray-300 rounded-lg p-6 min-h-[300px] bg-white">
            {prescription.prescription_notes ? (
              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                {prescription.prescription_notes}
              </div>
            ) : (
              <div className="text-gray-400 italic">
                Handwritten prescription area
              </div>
            )}
            
            {/* Lined area for handwritten prescriptions */}
            {!prescription.prescription_notes && (
              <div className="mt-6 space-y-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="border-b border-gray-200 h-6"></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-4">Doctor's Signature:</p>
              <div className="border-b border-gray-300 h-16 flex items-end pb-2">
                {doctor.signature_url ? (
                  <img 
                    src={doctor.signature_url} 
                    alt="Doctor's Signature" 
                    className="h-12 object-contain"
                  />
                ) : (
                  <div className="text-gray-400 italic">
                    (Signature)
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">{doctor.name}</p>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">
                Generated by MediPOS System
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Print Date: {printData.print_date}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Prescription ID: {prescription.id.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-4 {
            padding: 1rem !important;
          }
          
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          .min-h-screen {
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OPDPrescriptionPrint;