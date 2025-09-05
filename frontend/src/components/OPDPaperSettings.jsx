import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { 
  Stethoscope,
  Settings as SettingsIcon,
  Code,
  Eye,
  Layout,
  FileText,
  Palette,
  Copy,
  RefreshCw,
  Download,
  Maximize2,
  Minimize2,
  Monitor,
  Save,
  FolderPlus,
  Trash2,
  Edit3,
  Share2,
  Import,
  Upload,
  Plus,
  Star,
  Clock
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OPDPaperSettings = ({ settings, updateSetting }) => {
  const [previewData, setPreviewData] = useState({
    clinic_name: "MediPOS Clinic",
    clinic_address: "123 Health Street, Medical District, City 12345",
    clinic_phone: "+1-234-567-8900",
    clinic_email: "info@medipos.com",
    clinic_website: "www.medipos.com",
    doctor_name: "Aisha Khan",
    doctor_specialization: "General Medicine",
    doctor_qualification: "MD, MBBS",
    doctor_license: "MED12345",
    doctor_phone: "+1-234-567-8901",
    doctor_email: "dr.aisha@medipos.com",
    patient_name: "John Smith",
    patient_age: "35",
    patient_gender: "Male",
    patient_phone: "+1-234-567-8902",
    patient_address: "456 Oak Avenue, City, State",
    prescription_date: new Date().toLocaleDateString(),
    prescription_time: new Date().toLocaleTimeString(),
    prescription_id: "RX" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    consultation_fee: "150.00",
    next_visit_date: new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString(),
    prescription_notes: "1. Paracetamol 500mg - 1 tablet twice daily after meals\n2. Amoxicillin 250mg - 1 capsule three times daily\n3. Rest and plenty of fluids\n\nFollow up after 3 days if symptoms persist.",
    medical_history: "Hypertension, Diabetes",
    symptoms: "Fever, headache, body ache",
    diagnosis: "Viral fever",
    print_instructions: settings.opd_paper.print_instructions || "Please follow doctor's instructions carefully"
  });

  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const previewRef = useRef(null);
  const htmlEditorRef = useRef(null);
  const cssEditorRef = useRef(null);
  
  // Custom template management states
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [templateToSave, setTemplateToSave] = useState({ name: "", description: "" });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Load custom templates on component mount
  useEffect(() => {
    fetchCustomTemplates();
  }, []);

  const fetchCustomTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await axios.get(`${API}/custom-templates`);
      setCustomTemplates(response.data);
    } catch (error) {
      console.error("Error fetching custom templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const saveCurrentAsTemplate = () => {
    setTemplateToSave({ name: "", description: "" });
    setShowSaveTemplateDialog(true);
  };

  const confirmSaveTemplate = async () => {
    if (!templateToSave.name.trim()) {
      alert("Please enter a template name");
      return;
    }

    setSavingTemplate(true);
    try {
      const templateData = {
        name: templateToSave.name,
        description: templateToSave.description,
        html: settings.opd_paper.custom_html || getDefaultHTML(),
        css: settings.opd_paper.custom_css || getDefaultCSS(),
        category: "custom",
        is_public: false
      };

      await axios.post(`${API}/custom-templates`, templateData);
      
      // Refresh templates list
      await fetchCustomTemplates();
      
      setShowSaveTemplateDialog(false);
      setTemplateToSave({ name: "", description: "" });
      alert("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Error saving template: " + (error.response?.data?.detail || "Unknown error"));
    } finally {
      setSavingTemplate(false);
    }
  };

  const loadCustomTemplate = async (templateId) => {
    try {
      const response = await axios.get(`${API}/custom-templates/${templateId}`);
      const template = response.data;
      
      updateSetting('opd_paper', 'custom_html', template.html);
      updateSetting('opd_paper', 'custom_css', template.css);
      
      setSelectedTemplate(`custom_${templateId}`);
      setShowTemplateManager(false);
      alert(`Template "${template.name}" loaded successfully!`);
    } catch (error) {
      console.error("Error loading custom template:", error);
      alert("Error loading template: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const deleteCustomTemplate = async (templateId, templateName) => {
    if (!confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/custom-templates/${templateId}`);
      await fetchCustomTemplates();
      alert("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Error deleting template: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const duplicateTemplate = async (templateId, originalName) => {
    const newName = prompt(`Enter name for the duplicated template:`, `${originalName} (Copy)`);
    if (!newName) return;

    try {
      await axios.post(`${API}/custom-templates/${templateId}/duplicate?new_name=${encodeURIComponent(newName)}`);
      await fetchCustomTemplates();
      alert("Template duplicated successfully!");
    } catch (error) {
      console.error("Error duplicating template:", error);
      alert("Error duplicating template: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const exportTemplate = async (templateId) => {
    try {
      const response = await axios.get(`${API}/custom-templates/${templateId}/export`);
      const templateData = response.data;
      
      const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting template:", error);
      alert("Error exporting template: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const importTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const templateData = JSON.parse(text);
        
        await axios.post(`${API}/custom-templates/import`, templateData);
        await fetchCustomTemplates();
        alert("Template imported successfully!");
      } catch (error) {
        console.error("Error importing template:", error);
        alert("Error importing template: " + (error.response?.data?.detail || "Invalid template file"));
      }
    };
    input.click();
  };

  const updatePreview = () => {
    if (previewRef.current) {
      let htmlContent = settings.opd_paper.custom_html_enabled 
        ? settings.opd_paper.custom_html 
        : getDefaultHTML();
      
      let cssContent = settings.opd_paper.custom_html_enabled 
        ? settings.opd_paper.custom_css 
        : getDefaultCSS();

      // Replace placeholders with preview data
      Object.entries(previewData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      });

      // Inject CSS into HTML
      if (cssContent) {
        htmlContent = htmlContent.replace(
          '</style>',
          `${cssContent}\n</style>`
        );
      }

      // Create a complete HTML document for preview
      const completeHTML = `
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: ${settings.opd_paper.font_family || 'Arial'}, sans-serif;
                font-size: ${settings.opd_paper.font_size || 12}px;
                line-height: 1.6;
                background: white;
              }
              @media print {
                body { margin: ${settings.opd_paper.margin_top || 20}mm ${settings.opd_paper.margin_right || 20}mm ${settings.opd_paper.margin_bottom || 20}mm ${settings.opd_paper.margin_left || 20}mm; }
              }
            </style>
            ${cssContent ? `<style>${cssContent}</style>` : ''}
          </head>
          <body>
            ${htmlContent.replace(/<html.*?>|<\/html>|<head.*?>.*?<\/head>|<body.*?>|<\/body>/gis, '')}
          </body>
        </html>
      `;

      const blob = new Blob([completeHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      previewRef.current.src = url;
    }
  };

  useEffect(() => {
    updatePreview();
  }, [settings.opd_paper, previewData]);

  const templates = {
    default: {
      name: "Classic Professional",
      description: "Traditional prescription layout with colored sections",
      html: `<!DOCTYPE html>
<html>
<head>
    <title>OPD Prescription</title>
</head>
<body>
    <div class="header">
        <div class="clinic-name">{{clinic_name}}</div>
        <div class="clinic-address">{{clinic_address}}</div>
    </div>
    
    <div class="doctor-info">
        <strong>Dr. {{doctor_name}}</strong><br>
        {{doctor_specialization}}<br>
        {{doctor_qualification}}<br>
        License: {{doctor_license}}
    </div>
    
    <div class="patient-info">
        <strong>Patient:</strong> {{patient_name}}<br>
        <strong>Date:</strong> {{prescription_date}}<br>
        <strong>Age:</strong> {{patient_age}} | <strong>Gender:</strong> {{patient_gender}}
    </div>
    
    <div class="prescription-area">
        <strong>Rx</strong><br><br>
        <pre>{{prescription_notes}}</pre>
    </div>
    
    <div class="footer">
        <p>{{print_instructions}}</p>
        <br>
        <p>Doctor's Signature: _________________</p>
    </div>
</body>
</html>`,
      css: `/* Classic Professional Template */
.header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #333;
    padding-bottom: 15px;
}

.clinic-name {
    font-size: 18px;
    font-weight: bold;
    color: #2c5282;
    margin-bottom: 5px;
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
}`
    },
    minimal: {
      name: "Modern Minimal",
      description: "Clean, minimalist design with subtle lines",
      html: `<!DOCTYPE html>
<html>
<head>
    <title>Prescription</title>
</head>
<body>
    <div class="container">
        <header class="clinic-header">
            <h1>{{clinic_name}}</h1>
            <p>{{clinic_address}}</p>
            <p>{{clinic_phone}} | {{clinic_email}}</p>
        </header>
        
        <div class="prescription-meta">
            <div class="doctor-details">
                <h3>Dr. {{doctor_name}}</h3>
                <p>{{doctor_specialization}} | {{doctor_qualification}}</p>
                <p>License: {{doctor_license}}</p>
            </div>
            <div class="prescription-info">
                <p><strong>Date:</strong> {{prescription_date}}</p>
                <p><strong>Prescription ID:</strong> {{prescription_id}}</p>
            </div>
        </div>
        
        <div class="patient-section">
            <h4>Patient Information</h4>
            <div class="patient-grid">
                <div><strong>Name:</strong> {{patient_name}}</div>
                <div><strong>Age:</strong> {{patient_age}}</div>
                <div><strong>Gender:</strong> {{patient_gender}}</div>
                <div><strong>Phone:</strong> {{patient_phone}}</div>
            </div>
        </div>
        
        <div class="prescription-section">
            <h4>Prescription</h4>
            <div class="rx-content">
                <pre>{{prescription_notes}}</pre>
            </div>
        </div>
        
        <div class="footer-section">
            <div class="instructions">{{print_instructions}}</div>
            <div class="signature-line">
                <p>Doctor's Signature</p>
                <div class="signature-space"></div>
            </div>
        </div>
    </div>
</body>
</html>`,
      css: `/* Modern Minimal Template */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #2d3748;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
}

.container {
    background: white;
}

.clinic-header {
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 20px;
    margin-bottom: 30px;
}

.clinic-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 300;
    color: #1a202c;
    letter-spacing: -0.5px;
}

.clinic-header p {
    margin: 5px 0;
    color: #718096;
    font-size: 14px;
}

.prescription-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f7fafc;
}

.doctor-details h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 500;
    color: #2d3748;
}

.doctor-details p, .prescription-info p {
    margin: 4px 0;
    font-size: 14px;
    color: #4a5568;
}

.patient-section, .prescription-section {
    margin-bottom: 30px;
}

.patient-section h4, .prescription-section h4 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
}

.patient-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    font-size: 14px;
}

.rx-content {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 20px;
    min-height: 200px;
}

.rx-content pre {
    margin: 0;
    font-family: inherit;
    white-space: pre-wrap;
    font-size: 14px;
    line-height: 1.8;
}

.footer-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
}

.instructions {
    font-size: 12px;
    color: #718096;
    font-style: italic;
}

.signature-line p {
    margin: 0 0 10px 0;
    font-size: 12px;
    color: #4a5568;
}

.signature-space {
    width: 200px;
    height: 1px;
    border-bottom: 1px solid #2d3748;
}`
    },
    compact: {
      name: "Compact Clean",
      description: "Space-efficient design for smaller papers",
      html: `<!DOCTYPE html>
<html>
<head>
    <title>Prescription</title>
</head>
<body>
    <div class="prescription-header">
        <div class="clinic-info">
            <h2>{{clinic_name}}</h2>
            <span>{{clinic_phone}} • {{clinic_email}}</span>
        </div>
        <div class="rx-id">{{prescription_id}}</div>
    </div>
    
    <div class="doctor-patient-row">
        <div class="doctor-col">
            <strong>Dr. {{doctor_name}}</strong><br>
            <small>{{doctor_specialization}}</small>
        </div>
        <div class="patient-col">
            <strong>{{patient_name}}</strong> ({{patient_age}}/{{patient_gender}})<br>
            <small>{{prescription_date}}</small>
        </div>
    </div>
    
    <div class="rx-section">
        <div class="rx-header">℞ Prescription</div>
        <div class="rx-body">{{prescription_notes}}</div>
    </div>
    
    <div class="prescription-footer">
        <div class="instructions">{{print_instructions}}</div>
        <div class="signature">Dr. {{doctor_name}}</div>
    </div>
</body>
</html>`,
      css: `/* Compact Clean Template */
body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    margin: 15px;
    color: #333;
}

.prescription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 2px solid #000;
    margin-bottom: 15px;
}

.clinic-info h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.clinic-info span {
    font-size: 11px;
    color: #666;
}

.rx-id {
    font-size: 11px;
    color: #666;
    font-weight: 500;
}

.doctor-patient-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 4px;
}

.doctor-col, .patient-col {
    flex: 1;
}

.doctor-col strong, .patient-col strong {
    color: #2c5282;
}

.doctor-col small, .patient-col small {
    color: #666;
    font-size: 11px;
}

.rx-section {
    margin-bottom: 20px;
}

.rx-header {
    font-size: 16px;
    font-weight: 600;
    color: #2c5282;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #ddd;
}

.rx-body {
    white-space: pre-wrap;
    background: white;
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 4px;
    min-height: 120px;
    font-size: 13px;
    line-height: 1.6;
}

.prescription-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
}

.instructions {
    font-size: 10px;
    color: #666;
    font-style: italic;
    flex: 1;
}

.signature {
    text-align: right;
    font-size: 11px;
    color: #333;
    border-bottom: 1px solid #333;
    padding-bottom: 2px;
    min-width: 150px;
}`
    },
    elegant: {
      name: "Elegant Professional",
      description: "Sophisticated design with elegant typography",
      html: `<!DOCTYPE html>
<html>
<head>
    <title>Medical Prescription</title>
</head>
<body>
    <div class="prescription-document">
        <header class="document-header">
            <div class="clinic-branding">
                <h1 class="clinic-name">{{clinic_name}}</h1>
                <p class="clinic-tagline">Excellence in Healthcare</p>
                <div class="clinic-contact">
                    {{clinic_address}}<br>
                    Tel: {{clinic_phone}} | Email: {{clinic_email}}
                </div>
            </div>
        </header>
        
        <section class="doctor-credentials">
            <h2>Dr. {{doctor_name}}</h2>
            <p class="credentials">{{doctor_qualification}} • {{doctor_specialization}}</p>
            <p class="license">Medical License: {{doctor_license}}</p>
        </section>
        
        <section class="patient-details">
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Patient Name</label>
                    <value>{{patient_name}}</value>
                </div>
                <div class="detail-item">
                    <label>Age / Gender</label>
                    <value>{{patient_age}} years / {{patient_gender}}</value>
                </div>
                <div class="detail-item">
                    <label>Date</label>
                    <value>{{prescription_date}}</value>
                </div>
                <div class="detail-item">
                    <label>Prescription ID</label>
                    <value>{{prescription_id}}</value>
                </div>
            </div>
        </section>
        
        <section class="medical-prescription">
            <h3>℞ Medical Prescription</h3>
            <div class="prescription-content">
                <pre>{{prescription_notes}}</pre>
            </div>
        </section>
        
        <footer class="document-footer">
            <div class="footer-content">
                <div class="instructions-block">
                    <h4>Important Instructions</h4>
                    <p>{{print_instructions}}</p>
                </div>
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <p>Dr. {{doctor_name}}<br><span>{{doctor_specialization}}</span></p>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>`,
      css: `/* Elegant Professional Template */
body {
    font-family: 'Georgia', 'Times New Roman', serif;
    line-height: 1.7;
    color: #2c3e50;
    background: #ffffff;
    margin: 0;
    padding: 30px;
}

.prescription-document {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
}

.document-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    text-align: center;
}

.clinic-name {
    font-size: 32px;
    font-weight: 300;
    margin: 0 0 5px 0;
    letter-spacing: 1px;
}

.clinic-tagline {
    font-style: italic;
    font-size: 14px;
    margin: 0 0 15px 0;
    opacity: 0.9;
}

.clinic-contact {
    font-size: 13px;
    opacity: 0.8;
    line-height: 1.4;
}

.doctor-credentials {
    padding: 25px 30px;
    border-bottom: 1px solid #ecf0f1;
    background: #f8f9fa;
}

.doctor-credentials h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #2c5282;
    font-weight: 400;
}

.credentials {
    margin: 0 0 5px 0;
    font-size: 16px;
    color: #34495e;
}

.license {
    margin: 0;
    font-size: 13px;
    color: #7f8c8d;
    font-style: italic;
}

.patient-details {
    padding: 25px 30px;
    background: white;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.detail-item {
    display: flex;
    flex-direction: column;
}

.detail-item label {
    font-size: 12px;
    color: #7f8c8d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
    font-weight: 600;
}

.detail-item value {
    font-size: 15px;
    color: #2c3e50;
    font-weight: 500;
}

.medical-prescription {
    padding: 25px 30px;
    background: white;
}

.medical-prescription h3 {
    font-size: 20px;
    color: #2c5282;
    margin: 0 0 20px 0;
    font-weight: 400;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
}

.prescription-content {
    background: #f8f9fa;
    border-left: 4px solid #3498db;
    padding: 20px;
    border-radius: 0 4px 4px 0;
}

.prescription-content pre {
    margin: 0;
    font-family: 'Georgia', serif;
    font-size: 15px;
    line-height: 1.8;
    white-space: pre-wrap;
    color: #2c3e50;
}

.document-footer {
    background: #ecf0f1;
    padding: 25px 30px;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.instructions-block h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #2c5282;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.instructions-block p {
    margin: 0;
    font-size: 12px;
    color: #7f8c8d;
    font-style: italic;
    max-width: 300px;
}

.signature-block {
    text-align: center;
}

.signature-line {
    width: 200px;
    height: 1px;
    background: #34495e;
    margin-bottom: 8px;
}

.signature-block p {
    margin: 0;
    font-size: 13px;
    color: #2c3e50;
}

.signature-block span {
    font-size: 11px;
    color: #7f8c8d;
    font-style: italic;
}`
    }
  };

  const getDefaultHTML = () => templates[selectedTemplate]?.html || templates.default.html;

  const getDefaultCSS = () => templates[selectedTemplate]?.css || templates.default.css;

  const loadTemplate = (templateKey) => {
    const template = templates[templateKey];
    if (template) {
      setSelectedTemplate(templateKey);
      updateSetting('opd_paper', 'custom_html', template.html);
      updateSetting('opd_paper', 'custom_css', template.css);
    }
  };

  const allPlaceholders = [
    { category: "Clinic Information", placeholders: [
      { name: "{{clinic_name}}", description: "Name of the clinic/hospital" },
      { name: "{{clinic_address}}", description: "Complete address of the clinic" },
      { name: "{{clinic_phone}}", description: "Clinic contact number" },
      { name: "{{clinic_email}}", description: "Clinic email address" },
      { name: "{{clinic_website}}", description: "Clinic website URL" }
    ]},
    { category: "Doctor Information", placeholders: [
      { name: "{{doctor_name}}", description: "Doctor's full name" },
      { name: "{{doctor_specialization}}", description: "Medical specialization" },
      { name: "{{doctor_qualification}}", description: "Medical degrees and qualifications" },
      { name: "{{doctor_license}}", description: "Medical license number" },
      { name: "{{doctor_phone}}", description: "Doctor's contact number" },
      { name: "{{doctor_email}}", description: "Doctor's email address" }
    ]},
    { category: "Patient Information", placeholders: [
      { name: "{{patient_name}}", description: "Patient's full name" },
      { name: "{{patient_age}}", description: "Patient's age" },
      { name: "{{patient_gender}}", description: "Patient's gender" },
      { name: "{{patient_phone}}", description: "Patient's contact number" },
      { name: "{{patient_address}}", description: "Patient's address" },
      { name: "{{medical_history}}", description: "Patient's medical history" }
    ]},
    { category: "Prescription Details", placeholders: [
      { name: "{{prescription_date}}", description: "Date of prescription" },
      { name: "{{prescription_time}}", description: "Time of prescription" },
      { name: "{{prescription_id}}", description: "Unique prescription ID" },
      { name: "{{prescription_notes}}", description: "Main prescription content" },
      { name: "{{symptoms}}", description: "Patient's symptoms" },
      { name: "{{diagnosis}}", description: "Medical diagnosis" },
      { name: "{{consultation_fee}}", description: "Consultation fee amount" },
      { name: "{{next_visit_date}}", description: "Next appointment date" }
    ]},
    { category: "Additional", placeholders: [
      { name: "{{print_instructions}}", description: "General instructions for patient" },
      { name: "{{watermark_text}}", description: "Watermark text (if enabled)" }
    ]}
  ];

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${type} copied to clipboard!`);
    });
  };

  const downloadTemplate = () => {
    const htmlContent = settings.opd_paper.custom_html || getDefaultHTML();
    const cssContent = settings.opd_paper.custom_css || getDefaultCSS();
    
    const completeHTML = `<!DOCTYPE html>
<html>
<head>
    <title>OPD Prescription Template</title>
    <style>
${cssContent}
    </style>
</head>
<body>
${htmlContent.replace(/<html.*?>|<\/html>|<head.*?>.*?<\/head>|<body.*?>|<\/body>/gis, '')}
</body>
</html>`;

    const blob = new Blob([completeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opd-prescription-template.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefault = () => {
    if (confirm('Are you sure you want to reset to default template? This will overwrite your current HTML and CSS.')) {
      updateSetting('opd_paper', 'custom_html', getDefaultHTML());
      updateSetting('opd_paper', 'custom_css', getDefaultCSS());
    }
  };

  return (
    <div className="grid gap-6">
      {/* Configuration Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Stethoscope className="mr-2 h-5 w-5 text-green-600" />
              OPD Prescription Paper Configuration
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="custom_html_enabled" className="text-sm">Enable Custom HTML/CSS</Label>
              <input
                type="checkbox"
                id="custom_html_enabled"
                checked={settings.opd_paper.custom_html_enabled}
                onChange={(e) => updateSetting('opd_paper', 'custom_html_enabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue={settings.opd_paper.custom_html_enabled ? "custom" : "basic"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Basic Settings
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center">
            <Code className="mr-2 h-4 w-4" />
            Custom HTML/CSS
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <FolderPlus className="mr-2 h-4 w-4" />
            Template Manager
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            Live Preview
          </TabsTrigger>
        </TabsList>

        {/* Basic Settings Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layout className="mr-2 h-5 w-5 text-blue-600" />
                Basic Paper Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="paper_size">Paper Size</Label>
                <select
                  id="paper_size"
                  value={settings.opd_paper.paper_size}
                  onChange={(e) => updateSetting('opd_paper', 'paper_size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="A5">A5 (148 × 210 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Legal">Legal (8.5 × 14 in)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="font_family">Font Family</Label>
                <select
                  id="font_family"
                  value={settings.opd_paper.font_family}
                  onChange={(e) => updateSetting('opd_paper', 'font_family', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Calibri">Calibri</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>

              <div>
                <Label htmlFor="font_size">Base Font Size</Label>
                <Input
                  id="font_size"
                  type="number"
                  min="8"
                  max="16"
                  value={settings.opd_paper.font_size}
                  onChange={(e) => updateSetting('opd_paper', 'font_size', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="margin_top">Top Margin (mm)</Label>
                <Input
                  id="margin_top"
                  type="number"
                  min="10"
                  max="50"
                  value={settings.opd_paper.margin_top}
                  onChange={(e) => updateSetting('opd_paper', 'margin_top', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="margin_bottom">Bottom Margin (mm)</Label>
                <Input
                  id="margin_bottom"
                  type="number"
                  min="10"
                  max="50"
                  value={settings.opd_paper.margin_bottom}
                  onChange={(e) => updateSetting('opd_paper', 'margin_bottom', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="margin_left">Left Margin (mm)</Label>
                <Input
                  id="margin_left"
                  type="number"
                  min="10"
                  max="50"
                  value={settings.opd_paper.margin_left}
                  onChange={(e) => updateSetting('opd_paper', 'margin_left', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="margin_right">Right Margin (mm)</Label>
                <Input
                  id="margin_right"
                  type="number"
                  min="10"
                  max="50"
                  value={settings.opd_paper.margin_right}
                  onChange={(e) => updateSetting('opd_paper', 'margin_right', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="clinic_name_size">Clinic Name Font Size</Label>
                <Input
                  id="clinic_name_size"
                  type="number"
                  min="12"
                  max="24"
                  value={settings.opd_paper.clinic_name_size}
                  onChange={(e) => updateSetting('opd_paper', 'clinic_name_size', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="doctor_name_size">Doctor Name Font Size</Label>
                <Input
                  id="doctor_name_size"
                  type="number"
                  min="10"
                  max="20"
                  value={settings.opd_paper.doctor_name_size}
                  onChange={(e) => updateSetting('opd_paper', 'doctor_name_size', parseInt(e.target.value))}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="watermark_text">Watermark Text</Label>
                <Input
                  id="watermark_text"
                  value={settings.opd_paper.watermark_text}
                  onChange={(e) => updateSetting('opd_paper', 'watermark_text', e.target.value)}
                  placeholder="Enter watermark text (optional)"
                />
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="print_instructions">Print Instructions</Label>
                <Input
                  id="print_instructions"
                  value={settings.opd_paper.print_instructions}
                  onChange={(e) => updateSetting('opd_paper', 'print_instructions', e.target.value)}
                  placeholder="Instructions to be printed on prescription"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom HTML/CSS Tab */}
        <TabsContent value="custom">
          <div className="grid gap-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layout className="mr-2 h-5 w-5 text-indigo-600" />
                  Choose Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(templates).map(([key, template]) => (
                    <div
                      key={key}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => loadTemplate(key)}
                    >
                      <h4 className="font-semibold text-sm mb-2">{template.name}</h4>
                      <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded ${
                          selectedTemplate === key ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedTemplate === key ? 'Selected' : 'Click to select'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* HTML Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    HTML Template
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(settings.opd_paper.custom_html || getDefaultHTML(), 'HTML')}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={saveCurrentAsTemplate}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save as Template
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetToDefault}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  ref={htmlEditorRef}
                  value={settings.opd_paper.custom_html || getDefaultHTML()}
                  onChange={(e) => updateSetting('opd_paper', 'custom_html', e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your custom HTML template..."
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            {/* CSS Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Palette className="mr-2 h-5 w-5 text-purple-600" />
                    CSS Styles
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(settings.opd_paper.custom_css || getDefaultCSS(), 'CSS')}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  ref={cssEditorRef}
                  value={settings.opd_paper.custom_css || getDefaultCSS()}
                  onChange={(e) => updateSetting('opd_paper', 'custom_css', e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your custom CSS styles..."
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            {/* Comprehensive Placeholders Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-green-600" />
                  Complete Placeholders Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {allPlaceholders.map((category, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-sm mb-3 text-gray-800 border-b border-gray-200 pb-2">
                        {category.category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.placeholders.map((placeholder, pIndex) => (
                          <div key={pIndex} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {placeholder.name}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(placeholder.name, 'Placeholder')}
                                title="Copy placeholder"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600">{placeholder.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">💡 Template Usage Tips</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Use placeholders exactly as shown, including the double curly braces</li>
                      <li>• Placeholders are case-sensitive and must match exactly</li>
                      <li>• You can use HTML tags around placeholders for formatting</li>
                      <li>• CSS classes can be applied to elements containing placeholders</li>
                      <li>• Empty placeholders will show as blank in the final output</li>
                      <li>• Use conditional CSS (display: none) to hide sections when placeholders are empty</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Template Manager Tab */}
        <TabsContent value="templates">
          <div className="grid gap-6">
            {/* Template Manager Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FolderPlus className="mr-2 h-5 w-5 text-green-600" />
                    Template Manager
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={importTemplate}
                    >
                      <Import className="mr-2 h-4 w-4" />
                      Import Template
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={saveCurrentAsTemplate}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Save Current
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchCustomTemplates}
                      disabled={loadingTemplates}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${loadingTemplates ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your custom OPD prescription templates. Save your current design, load existing templates, or import templates from files.
                </p>
                
                {/* Template Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Total Templates</div>
                    <div className="text-2xl font-bold text-blue-600">{customTemplates.length}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-800">Custom Templates</div>
                    <div className="text-2xl font-bold text-green-600">
                      {customTemplates.filter(t => t.category === 'custom').length}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Shared Templates</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {customTemplates.filter(t => t.is_public).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Saved Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading templates...</span>
                  </div>
                ) : customTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">No custom templates saved yet</p>
                    <Button onClick={saveCurrentAsTemplate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Save Your First Template
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {template.description || "No description provided"}
                            </p>
                          </div>
                          {template.is_public && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Share2 className="w-3 h-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(template.created_at).toLocaleDateString()}
                          </div>
                          <Badge className="bg-gray-100 text-gray-600">
                            {template.category}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadCustomTemplate(template.id)}
                            className="text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Load
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportTemplate(template.id)}
                            className="text-xs"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateTemplate(template.id, template.name)}
                            className="text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Duplicate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCustomTemplate(template.id, template.name)}
                            className="text-xs text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Preview Tab */}
        <TabsContent value="preview">
          <div className="grid gap-6">
            {/* Preview Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Monitor className="mr-2 h-5 w-5 text-green-600" />
                    Live Preview
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={updatePreview}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={downloadTemplate}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFullScreenPreview(!fullScreenPreview)}
                    >
                      {fullScreenPreview ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                      {fullScreenPreview ? 'Exit Fullscreen' : 'Fullscreen'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label htmlFor="preview_patient_name">Patient Name</Label>
                    <Input
                      id="preview_patient_name"
                      value={previewData.patient_name}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, patient_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preview_patient_age">Age</Label>
                    <Input
                      id="preview_patient_age"
                      value={previewData.patient_age}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, patient_age: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preview_patient_gender">Gender</Label>
                    <select
                      id="preview_patient_gender"
                      value={previewData.patient_gender}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, patient_gender: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="preview_doctor_name">Doctor Name</Label>
                    <Input
                      id="preview_doctor_name"
                      value={previewData.doctor_name}
                      onChange={(e) => setPreviewData(prev => ({ ...prev, doctor_name: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Frame */}
            <Card className={fullScreenPreview ? "fixed inset-0 z-50 bg-white" : ""}>
              <CardContent className={`p-4 ${fullScreenPreview ? "h-full" : ""}`}>
                <iframe
                  ref={previewRef}
                  className={`w-full border border-gray-300 rounded ${fullScreenPreview ? "h-full" : "h-96"}`}
                  title="OPD Prescription Preview"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Save Template Dialog */}
      {showSaveTemplateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Save as Template</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSaveTemplateDialog(false)}
                disabled={savingTemplate}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="template_name">Template Name *</Label>
                <Input
                  id="template_name"
                  value={templateToSave.name}
                  onChange={(e) => setTemplateToSave(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                  disabled={savingTemplate}
                />
              </div>
              
              <div>
                <Label htmlFor="template_description">Description</Label>
                <textarea
                  id="template_description"
                  value={templateToSave.description}
                  onChange={(e) => setTemplateToSave(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter template description (optional)"
                  disabled={savingTemplate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm text-blue-800 mb-2">Template Preview</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• Current HTML/CSS will be saved</div>
                  <div>• Template will be saved as "Custom" category</div>
                  <div>• You can load this template anytime from Template Manager</div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button 
                onClick={confirmSaveTemplate}
                disabled={savingTemplate || !templateToSave.name.trim()}
                className="flex-1"
              >
                {savingTemplate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSaveTemplateDialog(false)}
                disabled={savingTemplate}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OPDPaperSettings;