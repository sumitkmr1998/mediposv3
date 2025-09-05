import React from "react";
import { Card, CardContent } from "./ui/card";

const OPDPaperPreview = ({ settings, sampleData }) => {
  const { general, opd_paper } = settings;
  const { doctor, patient } = sampleData;

  // Get section order from settings
  const sectionOrder = opd_paper.section_order || ['shop', 'doctor', 'patient'];
  
  const renderShopSection = () => {
    if (!opd_paper.show_shop_details) return null;
    
    return (
      <div className="text-center border-b pb-3 mb-3">
        <h1 className="font-bold text-blue-800" style={{ fontSize: `${opd_paper.clinic_name_size || 18}px` }}>
          {general.shop_name || "MediPOS Pharmacy"}
        </h1>
        <p className="text-blue-600 text-sm">{general.shop_address || "123 Main Street, City, State"}</p>
        <div className="flex justify-center space-x-4 text-xs text-gray-600 mt-1">
          {general.shop_phone && <span>📞 {general.shop_phone}</span>}
          {general.shop_email && <span>✉️ {general.shop_email}</span>}
          {general.shop_license && <span>License: {general.shop_license}</span>}
        </div>
      </div>
    );
  };

  const renderDoctorSection = () => {
    if (!opd_paper.show_doctor_details) return null;
    
    return (
      <div className="text-center pb-3 mb-3">
        <h2 className="font-bold text-gray-900" style={{ fontSize: `${opd_paper.doctor_name_size || 16}px` }}>
          {doctor.name}
        </h2>
        <p className="text-gray-700 text-sm">{doctor.qualification}</p>
        <p className="text-gray-600 text-sm">{doctor.specialization}</p>
        <p className="text-gray-500 text-xs">License: {doctor.license_number}</p>
        
        {doctor.clinic_name && (
          <div className="mt-2">
            <p className="font-medium text-gray-800 text-sm">{doctor.clinic_name}</p>
            {doctor.clinic_address && (
              <p className="text-gray-600 text-xs">{doctor.clinic_address}</p>
            )}
          </div>
        )}
        
        <div className="flex justify-center space-x-4 text-xs text-gray-600 mt-1">
          {doctor.phone && <span>📞 {doctor.phone}</span>}
          {doctor.email && <span>✉️ {doctor.email}</span>}
        </div>
      </div>
    );
  };

  const renderPatientSection = () => {
    if (!opd_paper.show_patient_details) return null;
    
    const age = patient.date_of_birth ? 
      new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : null;
    
    return (
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Patient Information</h3>
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded text-xs">
          <div>
            <p><strong>Name:</strong> {patient.name}</p>
            {age && <p><strong>Age:</strong> {age} years</p>}
            {patient.gender && <p><strong>Gender:</strong> {patient.gender}</p>}
          </div>
          <div>
            {patient.phone && <p><strong>Phone:</strong> {patient.phone}</p>}
            {patient.address && <p><strong>Address:</strong> {patient.address}</p>}
          </div>
        </div>
        
        {patient.medical_history && patient.medical_history !== "None" && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p><strong>Medical History:</strong> {patient.medical_history}</p>
          </div>
        )}
      </div>
    );
  };

  const getSectionComponent = (sectionName) => {
    switch (sectionName) {
      case 'shop': return renderShopSection();
      case 'doctor': return renderDoctorSection();
      case 'patient': return renderPatientSection();
      default: return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6" style={{ 
        fontFamily: opd_paper.font_family || 'Arial',
        fontSize: `${opd_paper.font_size || 12}px`,
        backgroundColor: 'white'
      }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-lg font-semibold text-blue-600 mb-2">
            OPD PRESCRIPTION
          </div>
        </div>
        
        {/* Render sections in the specified order */}
        {sectionOrder.map((sectionName, index) => (
          <div key={sectionName}>
            {getSectionComponent(sectionName)}
            {index < sectionOrder.length - 1 && <div className="border-b border-gray-200 mb-3"></div>}
          </div>
        ))}

        {/* Visit Details */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">Visit Details</h3>
          <div className="grid grid-cols-2 gap-2 bg-blue-50 p-3 rounded text-xs">
            <div>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Next Visit:</strong> Follow-up as needed</p>
            </div>
          </div>
        </div>

        {/* Prescription Area */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">℞ Prescription</h3>
          <div className="border border-gray-300 rounded p-3 bg-white" 
               style={{ minHeight: `${(opd_paper.prescription_area_lines || 15) * (opd_paper.line_height || 24)}px` }}>
            <div className="text-gray-400 italic text-xs">
              Prescription area - {opd_paper.prescription_area_lines || 15} lines available
            </div>
            
            {/* Sample prescription lines */}
            <div className="mt-2 space-y-2 text-xs">
              {Array.from({ length: Math.min(5, opd_paper.prescription_area_lines || 15) }, (_, i) => (
                <div key={i} className="border-b border-gray-200 h-4"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Signature */}
        <div className="flex justify-end mb-4">
          <div className="text-center">
            <div className="w-32 border-b border-gray-800 mb-1"></div>
            <p className="text-xs font-medium">Doctor's Signature</p>
            <p className="text-xs text-gray-600">{doctor.name}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-2">
          {opd_paper.print_instructions || "Please follow doctor's instructions carefully"}
          {opd_paper.watermark_text && (
            <div className="mt-1 text-gray-400 italic">
              {opd_paper.watermark_text}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OPDPaperPreview;