import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useFormatters } from "../hooks/useFormatters";
import DateRangeFilter from "./DateRangeFilter";
import { useSettings } from "../contexts/SettingsContext";
import PrescriptionRenderer from "./PrescriptionRenderer";
import { 
  Plus, 
  Search, 
  Eye,
  Printer,
  Stethoscope,
  Calendar,
  User,
  UserCheck,
  FileText,
  DollarSign,
  Clock
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OPDManagement = () => {
  // Get formatters from settings context
  const { formatCurrency, formatDateTime, formatDate } = useFormatters();
  const { settings } = useSettings();
  
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const [formData, setFormData] = useState({
    doctor_id: "",
    patient_id: "",
    consultation_fee: "",
    prescription_notes: "",
    next_visit_date: ""
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchDoctors();
    fetchPatients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [prescriptions, searchTerm, dateFilter]);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get(`${API}/opd-prescriptions`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
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

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API}/patients`);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...prescriptions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription => {
        const doctorName = getDoctorName(prescription.doctor_id).toLowerCase();
        const patientName = getPatientName(prescription.patient_id).toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return doctorName.includes(search) || 
               patientName.includes(search) || 
               prescription.id.toLowerCase().includes(search);
      });
    }

    // Apply date filter
    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate + "T23:59:59");
      
      filtered = filtered.filter(prescription => {
        const prescDate = new Date(prescription.date || prescription.created_at);
        return prescDate >= startDate && prescDate <= endDate;
      });
    }

    setFilteredPrescriptions(filtered);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setShowDateFilter(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/opd-prescriptions`, formData);
      fetchPrescriptions();
      resetForm();
    } catch (error) {
      console.error("Error creating prescription:", error);
      alert("Error creating prescription: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const handlePrint = async (prescriptionId) => {
    try {
      const response = await axios.get(`${API}/opd-prescriptions/${prescriptionId}/print`);
      setPrintData(response.data);
      setShowPrintView(true);
    } catch (error) {
      console.error("Error fetching print data:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      doctor_id: "",
      patient_id: "",
      consultation_fee: "",
      prescription_notes: "",
      next_visit_date: ""
    });
    setShowNewForm(false);
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : "Unknown Doctor";
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : "Unknown Patient";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">OPD Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Print View Component - Now using settings-based renderer
  if (showPrintView && printData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <PrescriptionRenderer 
          prescriptionData={printData}
          onClose={() => setShowPrintView(false)}
          showPrintButton={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">OPD Management</h1>
        <Button onClick={() => setShowNewForm(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          New Prescription
        </Button>
      </div>

      {/* OPD Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(filteredPrescriptions.reduce((sum, prescription) => 
                    sum + (parseFloat(prescription.consultation_fee) || 0), 0))}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Consultations</p>
                <p className="text-2xl font-bold text-green-600">{filteredPrescriptions.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Avg. Consultation Fee</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(() => {
                    const consultationsWithFee = filteredPrescriptions.filter(p => p.consultation_fee && p.consultation_fee > 0);
                    const avgFee = consultationsWithFee.length > 0 
                      ? consultationsWithFee.reduce((sum, p) => sum + parseFloat(p.consultation_fee), 0) / consultationsWithFee.length
                      : 0;
                    return formatCurrency(avgFee);
                  })()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(filteredPrescriptions.map(p => p.doctor_id)).size}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5 text-green-600" />
            Doctor Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(() => {
              const doctorStats = {};
              filteredPrescriptions.forEach(prescription => {
                const doctorId = prescription.doctor_id;
                if (!doctorStats[doctorId]) {
                  doctorStats[doctorId] = {
                    name: getDoctorName(doctorId),
                    consultations: 0,
                    totalRevenue: 0,
                    avgFee: 0
                  };
                }
                doctorStats[doctorId].consultations += 1;
                doctorStats[doctorId].totalRevenue += parseFloat(prescription.consultation_fee) || 0;
              });

              // Calculate average fees
              Object.keys(doctorStats).forEach(doctorId => {
                const stats = doctorStats[doctorId];
                stats.avgFee = stats.consultations > 0 ? stats.totalRevenue / stats.consultations : 0;
              });

              const sortedDoctors = Object.values(doctorStats)
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 5); // Top 5 doctors

              return sortedDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedDoctors.map((doctor, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Consultations:</span>
                          <span className="font-medium">{doctor.consultations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Revenue:</span>
                          <span className="font-medium text-green-600">{formatCurrency(doctor.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg. Fee:</span>
                          <span className="font-medium text-blue-600">{formatCurrency(doctor.avgFee)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No doctor performance data available</p>
                  <p className="text-sm">Data will appear here once consultations are recorded</p>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-600" />
            Recent Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              
              const todayPrescriptions = filteredPrescriptions.filter(p => 
                new Date(p.date || p.created_at) >= today
              );
              const weekPrescriptions = filteredPrescriptions.filter(p => 
                new Date(p.date || p.created_at) >= thisWeek
              );
              const monthPrescriptions = filteredPrescriptions.filter(p => 
                new Date(p.date || p.created_at) >= thisMonth
              );
              
              const periods = [
                { label: 'Today', prescriptions: todayPrescriptions, color: 'text-green-600' },
                { label: 'This Week', prescriptions: weekPrescriptions, color: 'text-blue-600' },
                { label: 'This Month', prescriptions: monthPrescriptions, color: 'text-purple-600' },
                { label: 'All Time', prescriptions: filteredPrescriptions, color: 'text-gray-600' }
              ];

              return periods.map((period, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">{period.label}</p>
                  <p className={`text-2xl font-bold ${period.color}`}>
                    {period.prescriptions.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(period.prescriptions.reduce((sum, p) => 
                      sum + (parseFloat(p.consultation_fee) || 0), 0))}
                  </p>
                </div>
              ));
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search prescriptions..."
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
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                {dateFilter && (
                  <span className="ml-2 font-medium">
                    ({dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate 
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

      {/* New Prescription Form */}
      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New OPD Prescription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor_id">Select Doctor *</Label>
                <select
                  id="doctor_id"
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="patient_id">Select Patient *</Label>
                <select
                  id="patient_id"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
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
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="next_visit_date">Next Visit Date</Label>
                <Input
                  id="next_visit_date"
                  type="datetime-local"
                  value={formData.next_visit_date}
                  onChange={(e) => setFormData({ ...formData, next_visit_date: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="prescription_notes">Prescription Notes</Label>
                <textarea
                  id="prescription_notes"
                  value={formData.prescription_notes}
                  onChange={(e) => setFormData({ ...formData, prescription_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter prescription details, medications, dosage, instructions..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Prescription
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Prescription List */}
      <div className="grid gap-4">
        {filteredPrescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">
                          Prescription #{prescription.id.slice(-8)}
                        </h3>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Dr. {getDoctorName(prescription.doctor_id)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="mr-2 h-4 w-4" />
                            {getPatientName(prescription.patient_id)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="mr-2 h-4 w-4" />
                            {formatDateTime(new Date(prescription.date))}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {prescription.consultation_fee && (
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="mr-2 h-4 w-4" />
                              Fee: {formatCurrency(prescription.consultation_fee)}
                            </div>
                          )}
                          {prescription.next_visit_date && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="mr-2 h-4 w-4" />
                              Next Visit: {formatDate(new Date(prescription.next_visit_date))}
                            </div>
                          )}
                        </div>
                      </div>

                      {prescription.prescription_notes && (
                        <div className="mt-3 p-3 bg-green-50 rounded-md">
                          <div className="flex items-start">
                            <FileText className="mr-2 h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-green-800 font-medium">Prescription Notes:</p>
                              <p className="text-sm text-green-700 whitespace-pre-wrap">
                                {prescription.prescription_notes.length > 100 
                                  ? prescription.prescription_notes.substring(0, 100) + "..."
                                  : prescription.prescription_notes
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrint(prescription.id)}
                    className="flex items-center"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No prescriptions found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || dateFilter ? "Try adjusting your search terms or filters." : "Get started by creating a new prescription."}
          </p>
          {!searchTerm && !dateFilter && (
            <div className="mt-6">
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Prescription
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OPDManagement;