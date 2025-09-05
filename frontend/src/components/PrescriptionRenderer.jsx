import React, { useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PrescriptionRenderer = ({ prescriptionData, onClose, showPrintButton = true }) => {
  const { settings } = useSettings();
  const [renderedHTML, setRenderedHTML] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (prescriptionData) {
      renderPrescription();
    }
  }, [prescriptionData, settings]);

  const renderPrescription = async () => {
    try {
      // Prepare data for template rendering
      const templateData = {
        // Clinic Information
        clinic_name: settings.general?.shop_name || "MediPOS Clinic",
        clinic_address: settings.general?.shop_address || "123 Health Street, Medical District",
        clinic_phone: settings.general?.shop_phone || "+1-234-567-8900",
        clinic_email: settings.general?.shop_email || "info@medipos.com",
        clinic_website: "www.medipos.com",
        
        // Doctor Information
        doctor_name: prescriptionData.doctor?.name || "Dr. Unknown",
        doctor_specialization: prescriptionData.doctor?.specialization || "General Medicine",
        doctor_qualification: prescriptionData.doctor?.qualification || "MD, MBBS",
        doctor_license: prescriptionData.doctor?.license_number || "N/A",
        doctor_phone: prescriptionData.doctor?.phone || "",
        doctor_email: prescriptionData.doctor?.email || "",
        
        // Patient Information
        patient_name: prescriptionData.patient?.name || "Unknown Patient",
        patient_age: calculateAge(prescriptionData.patient?.date_of_birth),
        patient_gender: prescriptionData.patient?.gender || "Not specified",
        patient_phone: prescriptionData.patient?.phone || "",
        patient_address: prescriptionData.patient?.address || "",
        medical_history: prescriptionData.patient?.medical_history || "",
        
        // Prescription Details
        prescription_date: new Date(prescriptionData.prescription.date || Date.now()).toLocaleDateString(),
        prescription_time: new Date(prescriptionData.prescription.date || Date.now()).toLocaleTimeString(),
        prescription_id: prescriptionData.prescription.id?.slice(-8).toUpperCase() || "N/A",
        prescription_notes: prescriptionData.prescription.prescription_notes || "",
        symptoms: prescriptionData.symptoms || "",
        diagnosis: prescriptionData.diagnosis || "",
        consultation_fee: prescriptionData.prescription.consultation_fee ? 
          new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.general?.currency || 'USD' })
            .format(prescriptionData.prescription.consultation_fee) : "",
        next_visit_date: prescriptionData.prescription.next_visit_date ? 
          new Date(prescriptionData.prescription.next_visit_date).toLocaleDateString() : "",
        
        // Additional
        print_instructions: settings.opd_paper?.print_instructions || "Please follow doctor's instructions carefully",
        watermark_text: settings.opd_paper?.watermark_text || ""
      };

      let htmlTemplate, cssTemplate;

      // Check if custom HTML/CSS is enabled and configured
      if (settings.opd_paper?.custom_html_enabled && 
          settings.opd_paper?.custom_html && 
          settings.opd_paper?.custom_css) {
        htmlTemplate = settings.opd_paper.custom_html;
        cssTemplate = settings.opd_paper.custom_css;
      } else {
        // Use default template based on basic settings
        htmlTemplate = generateDefaultHTML(templateData);
        cssTemplate = generateDefaultCSS();
      }

      // Replace placeholders with actual data
      let processedHTML = htmlTemplate;
      Object.entries(templateData).forEach(([key, value]) => {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedHTML = processedHTML.replace(placeholder, value || '');
      });

      // Create complete HTML document
      const completeHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OPD Prescription</title>
            <style>
                body { 
                    margin: 0; 
                    padding: ${settings.opd_paper?.margin_top || 20}mm ${settings.opd_paper?.margin_right || 20}mm ${settings.opd_paper?.margin_bottom || 20}mm ${settings.opd_paper?.margin_left || 20}mm;
                    font-family: ${settings.opd_paper?.font_family || 'Arial'}, sans-serif;
                    font-size: ${settings.opd_paper?.font_size || 12}px;
                    line-height: 1.6;
                    background: white;
                    color: #333;
                }
                
                @media print {
                    .print-hidden { display: none !important; }
                    body { 
                        margin: ${settings.opd_paper?.margin_top || 20}mm ${settings.opd_paper?.margin_right || 20}mm ${settings.opd_paper?.margin_bottom || 20}mm ${settings.opd_paper?.margin_left || 20}mm;
                    }
                    @page {
                        size: ${settings.opd_paper?.paper_size || 'A4'};
                        margin: 0;
                    }
                }
                
                ${cssTemplate}
                
                ${settings.opd_paper?.watermark_text ? `
                .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 48px;
                    color: rgba(0,0,0,0.1);
                    z-index: -1;
                    pointer-events: none;
                }
                ` : ''}
            </style>
        </head>
        <body>
            ${settings.opd_paper?.watermark_text ? `<div class="watermark">${settings.opd_paper.watermark_text}</div>` : ''}
            ${processedHTML.replace(/<html.*?>|<\/html>|<head.*?>.*?<\/head>|<body.*?>|<\/body>/gis, '')}
        </body>
        </html>
      `;

      setRenderedHTML(completeHTML);
    } catch (error) {
      console.error("Error rendering prescription:", error);
      // Fallback to basic rendering
      setRenderedHTML(generateFallbackHTML());
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  const generateDefaultHTML = (data) => {
    return `
      <div class="prescription-document">
        <header class="header">
          <div class="clinic-name">${data.clinic_name}</div>
          <div class="clinic-address">${data.clinic_address}</div>
          <div class="clinic-contact">${data.clinic_phone} | ${data.clinic_email}</div>
        </header>
        
        <section class="doctor-info">
          <strong>Dr. ${data.doctor_name}</strong><br>
          ${data.doctor_specialization}<br>
          ${data.doctor_qualification}<br>
          License: ${data.doctor_license}
        </section>
        
        <section class="patient-info">
          <strong>Patient:</strong> ${data.patient_name}<br>
          <strong>Date:</strong> ${data.prescription_date}<br>
          <strong>Age:</strong> ${data.patient_age} | <strong>Gender:</strong> ${data.patient_gender}
          ${data.patient_phone ? `<br><strong>Phone:</strong> ${data.patient_phone}` : ''}
        </section>
        
        ${data.medical_history ? `
        <section class="medical-history">
          <strong>Medical History:</strong> ${data.medical_history}
        </section>
        ` : ''}
        
        <section class="prescription-area">
          <strong>℞ Prescription</strong><br><br>
          <pre>${data.prescription_notes}</pre>
        </section>
        
        <footer class="footer">
          <p>${data.print_instructions}</p>
          <br>
          <p>Doctor's Signature: _________________</p>
        </footer>
      </div>
    `;
  };

  const generateDefaultCSS = () => {
    return `
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 15px;
      }
      
      .clinic-name {
        font-size: ${settings.opd_paper?.clinic_name_size || 18}px;
        font-weight: bold;
        color: #2c5282;
        margin-bottom: 5px;
      }
      
      .clinic-contact {
        font-size: 12px;
        color: #666;
      }
      
      .doctor-info {
        background-color: #f7fafc;
        padding: 15px;
        border-left: 4px solid #4299e1;
        margin: 20px 0;
      }
      
      .patient-info {
        background-color: #f0fff4;
        padding: 15px;
        border-left: 4px solid #48bb78;
        margin: 20px 0;
      }
      
      .medical-history {
        background-color: #fffbf0;
        padding: 15px;
        border-left: 4px solid #f6ad55;
        margin: 20px 0;
      }
      
      .prescription-area {
        background-color: #fffaf0;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        min-height: 300px;
      }
      
      .prescription-area pre {
        white-space: pre-wrap;
        font-family: inherit;
        margin: 10px 0;
      }
      
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
    `;
  };

  const generateFallbackHTML = () => {
    return `
      <html>
      <head><title>Prescription</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>OPD Prescription</h2>
        <p><strong>Doctor:</strong> ${prescriptionData.doctor?.name || 'N/A'}</p>
        <p><strong>Patient:</strong> ${prescriptionData.patient?.name || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(prescriptionData.prescription?.date || Date.now()).toLocaleDateString()}</p>
        <div style="border: 1px solid #ccc; padding: 20px; margin: 20px 0; min-height: 200px;">
          <strong>Prescription:</strong><br><br>
          ${prescriptionData.prescription?.prescription_notes || 'No prescription notes available'}
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    // Create a new window with the rendered HTML
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(renderedHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Rendering prescription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prescription-renderer">
      {showPrintButton && (
        <div className="print-hidden flex justify-between items-center mb-6 p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-semibold">Prescription Preview</h3>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>🖨️</span>
              <span>Print</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Prescription Preview */}
      <div className="prescription-preview bg-white shadow-lg">
        <iframe
          srcDoc={renderedHTML}
          className="w-full h-96 border border-gray-300 rounded"
          title="Prescription Preview"
        />
      </div>
    </div>
  );
};

export default PrescriptionRenderer;