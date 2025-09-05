import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import DateRangeFilter from "./DateRangeFilter";
import PrescriptionRenderer from "./PrescriptionRenderer";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  History,
  Stethoscope,
  ShoppingCart,
  FileText,
  X,
  RotateCcw
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [selectedPatientSales, setSelectedPatientSales] = useState([]);
  const [selectedPatientForSales, setSelectedPatientForSales] = useState(null);
  const [showOPDModal, setShowOPDModal] = useState(false);
  const [selectedPatientForOPD, setSelectedPatientForOPD] = useState(null);
  const [showPrescriptionPrint, setShowPrescriptionPrint] = useState(false);
  const [prescriptionPrintData, setPrescriptionPrintData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const [opdFormData, setOpdFormData] = useState({
    doctor_id: "",
    consultation_fee: "",
    prescription_notes: "",
    next_visit_date: ""
  });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    date_of_birth: "",
    gender: "",
    emergency_contact: "",
    medical_history: ""
  });

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [patients, searchTerm, dateFilter]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API}/patients`);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API}/doctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...patients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchTerm)) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply date filter (based on patient registration date)
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate + "T23:59:59");
      
      filtered = filtered.filter(patient => {
        const registrationDate = new Date(patient.created_at);
        return registrationDate >= startDate && registrationDate <= endDate;
      });
    }

    setFilteredPatients(filtered);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setShowDateFilter(false);
  };

  const fetchPatientSales = async (patientId) => {
    try {
      const response = await axios.get(`${API}/sales/patient/${patientId}`);
      setSelectedPatientSales(response.data);
    } catch (error) {
      console.error("Error fetching patient sales:", error);
      setSelectedPatientSales([]);
    }
  };

  const handleViewSales = async (patient) => {
    setSelectedPatientForSales(patient);
    await fetchPatientSales(patient.id);
    setShowSalesModal(true);
  };

  const handleDuplicateToCart = (sale) => {
    // Create URL with sale data to pass to POS
    const saleData = encodeURIComponent(JSON.stringify(sale));
    const posUrl = `/pos?loadSale=${saleData}&patient=${encodeURIComponent(JSON.stringify(selectedPatientForSales))}`;
    
    // Open POS in new tab/window with the sale data
    window.open(posUrl, '_blank');
    setShowSalesModal(false);
  };

  const handleCreateOPD = (patient) => {
    setSelectedPatientForOPD(patient);
    setOpdFormData({
      doctor_id: "",
      consultation_fee: "",
      prescription_notes: "",
      next_visit_date: ""
    });
    setShowOPDModal(true);
  };

  const handleOPDSubmit = async (e) => {
    e.preventDefault();
    try {
      const opdData = {
        doctor_id: opdFormData.doctor_id,
        patient_id: selectedPatientForOPD.id,
        consultation_fee: parseFloat(opdFormData.consultation_fee) || null,
        prescription_notes: opdFormData.prescription_notes || null,
        next_visit_date: opdFormData.next_visit_date ? new Date(opdFormData.next_visit_date).toISOString() : null
      };

      const response = await axios.post(`${API}/opd-prescriptions`, opdData);
      
      // Fetch the complete prescription data for printing
      const printResponse = await axios.get(`${API}/opd-prescriptions/${response.data.id}/print`);
      setPrescriptionPrintData(printResponse.data);
      
      setShowOPDModal(false);
      setShowPrescriptionPrint(true);
    } catch (error) {
      console.error("Error creating OPD prescription:", error);
      alert("Error creating OPD prescription: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await axios.put(`${API}/patients/${editingPatient.id}`, formData);
      } else {
        await axios.post(`${API}/patients`, formData);
      }
      fetchPatients();
      resetForm();
    } catch (error) {
      console.error("Error saving patient:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await axios.delete(`${API}/patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error("Error deleting patient:", error);
      }
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : "",
      gender: patient.gender || "",
      emergency_contact: patient.emergency_contact || "",
      medical_history: patient.medical_history || ""
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      date_of_birth: "",
      gender: "",
      emergency_contact: "",
      medical_history: ""
    });
    setEditingPatient(null);
    setShowAddForm(false);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DateRangeFilter 
          onFilterChange={handleDateFilterChange}
          showFilter={showDateFilter}
          setShowFilter={setShowDateFilter}
          currentFilter={dateFilter}
        />
      </div>

      {/* Results Summary */}
      {(searchTerm || dateFilter) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Showing {filteredPatients.length} of {patients.length} patients
                {dateFilter && (
                  <span className="ml-2 font-medium">
                    (registered {dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate 
                      ? `${dateFilter.startDate} to ${dateFilter.endDate}`
                      : dateFilter.type.replace('_', ' ')})
                  </span>
                )}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm("");
                setDateFilter(null);
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPatient ? "Edit Patient" : "Add New Patient"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="medical_history">Medical History</Label>
                <textarea
                  id="medical_history"
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter medical history, allergies, etc."
                />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPatient ? "Update" : "Add"} Patient
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Patient List */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => {
          const age = calculateAge(patient.date_of_birth);
          return (
            <Card key={patient.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <h3 className="text-lg font-semibold">{patient.name}</h3>
                          {age && (
                            <span className="text-sm text-gray-500">
                              ({age} years old)
                            </span>
                          )}
                          {patient.gender && (
                            <span className="text-sm text-gray-500">
                              • {patient.gender}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          {patient.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="mr-2 h-4 w-4" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="mr-2 h-4 w-4" />
                              {patient.email}
                            </div>
                          )}
                          {patient.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="mr-2 h-4 w-4" />
                              {patient.address}
                            </div>
                          )}
                          {patient.created_at && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="mr-2 h-4 w-4" />
                              Registered: {new Date(patient.created_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {patient.medical_history && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                            <p className="text-sm text-yellow-800">
                              <strong>Medical History:</strong> {patient.medical_history}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSales(patient)}
                        className="text-blue-600 hover:text-blue-700"
                        title="View Previous Sales"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateOPD(patient)}
                        className="text-green-600 hover:text-green-700"
                        title="Create OPD Prescription"
                      >
                        <Stethoscope className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(patient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(patient.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No patients found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || dateFilter ? "Try adjusting your search terms or filters." : "Get started by adding a new patient."}
          </p>
          {!searchTerm && !dateFilter && (
            <div className="mt-6">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Previous Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Previous Sales - {selectedPatientForSales?.name}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSalesModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedPatientSales.length === 0 ? (
              <div className="text-center py-8">
                <History className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No previous sales</h3>
                <p className="mt-1 text-sm text-gray-500">This patient has no previous purchase history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedPatientSales.map((sale) => (
                  <Card key={sale.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h4 className="font-medium">Sale #{sale.id.slice(-8)}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(sale.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              ${sale.total_amount.toFixed(2)}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {sale.payment_method.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Items ({sale.items.length}):</strong>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {sale.items.map((item, index) => (
                              <div key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                                <span>{item.medicine_name} x{item.quantity}</span>
                                <span>${item.total_price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          {sale.discount_amount > 0 && (
                            <div className="text-sm text-orange-600 mt-2">
                              Discount Applied: -${sale.discount_amount.toFixed(2)}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleDuplicateToCart(sale)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Duplicate to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create OPD Modal */}
      {showOPDModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Create OPD Prescription
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowOPDModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{selectedPatientForOPD?.name}</span>
              </div>
              {selectedPatientForOPD?.phone && (
                <div className="text-sm text-gray-600 mt-1">
                  📞 {selectedPatientForOPD.phone}
                </div>
              )}
            </div>

            <form onSubmit={handleOPDSubmit} className="space-y-4">
              <div>
                <Label htmlFor="doctor_id">Select Doctor *</Label>
                <select
                  id="doctor_id"
                  value={opdFormData.doctor_id}
                  onChange={(e) => setOpdFormData({ ...opdFormData, doctor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="consultation_fee">Consultation Fee</Label>
                <Input
                  id="consultation_fee"
                  type="number"
                  step="0.01"
                  value={opdFormData.consultation_fee}
                  onChange={(e) => setOpdFormData({ ...opdFormData, consultation_fee: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="next_visit_date">Next Visit Date</Label>
                <Input
                  id="next_visit_date"
                  type="date"
                  value={opdFormData.next_visit_date}
                  onChange={(e) => setOpdFormData({ ...opdFormData, next_visit_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="prescription_notes">Prescription Notes</Label>
                <textarea
                  id="prescription_notes"
                  value={opdFormData.prescription_notes}
                  onChange={(e) => setOpdFormData({ ...opdFormData, prescription_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter prescription details, instructions, etc."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowOPDModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  <FileText className="h-4 w-4 mr-1" />
                  Create Prescription
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Print Modal */}
      {showPrescriptionPrint && prescriptionPrintData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <PrescriptionRenderer 
              prescriptionData={prescriptionPrintData}
              onClose={() => {
                setShowPrescriptionPrint(false);
                setPrescriptionPrintData(null);
              }}
              showPrintButton={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;