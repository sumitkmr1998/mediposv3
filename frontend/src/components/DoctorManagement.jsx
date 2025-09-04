import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useFormatters } from "../hooks/useFormatters";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  CreditCard,
  Stethoscope
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DoctorManagement = () => {
  // Get formatters from settings context
  const { formatCurrency } = useFormatters();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    qualification: "",
    license_number: "",
    phone: "",
    email: "",
    clinic_name: "",
    clinic_address: "",
    consultation_fee: "",
    signature_url: ""
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API}/doctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await axios.put(`${API}/doctors/${editingDoctor.id}`, formData);
      } else {
        await axios.post(`${API}/doctors`, formData);
      }
      fetchDoctors();
      resetForm();
    } catch (error) {
      console.error("Error saving doctor:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this doctor?")) {
      try {
        await axios.delete(`${API}/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        console.error("Error deleting doctor:", error);
      }
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      license_number: doctor.license_number,
      phone: doctor.phone || "",
      email: doctor.email || "",
      clinic_name: doctor.clinic_name || "",
      clinic_address: doctor.clinic_address || "",
      consultation_fee: doctor.consultation_fee?.toString() || "",
      signature_url: doctor.signature_url || ""
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      specialization: "",
      qualification: "",
      license_number: "",
      phone: "",
      email: "",
      clinic_name: "",
      clinic_address: "",
      consultation_fee: "",
      signature_url: ""
    });
    setEditingDoctor(null);
    setShowAddForm(false);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.clinic_name && doctor.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Doctor Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="qualification">Qualification *</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="license_number">License Number *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
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
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input
                  id="clinic_name"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                />
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
              <div className="md:col-span-2">
                <Label htmlFor="clinic_address">Clinic Address</Label>
                <Input
                  id="clinic_address"
                  value={formData.clinic_address}
                  onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="signature_url">Signature URL (Optional)</Label>
                <Input
                  id="signature_url"
                  type="url"
                  value={formData.signature_url}
                  onChange={(e) => setFormData({ ...formData, signature_url: e.target.value })}
                  placeholder="https://example.com/signature.png"
                />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDoctor ? "Update" : "Add"} Doctor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Doctor List */}
      <div className="grid gap-4">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">{doctor.name}</h3>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {doctor.specialization}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          {doctor.qualification}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CreditCard className="mr-2 h-4 w-4" />
                          License: {doctor.license_number}
                        </div>
                        {doctor.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="mr-2 h-4 w-4" />
                            {doctor.phone}
                          </div>
                        )}
                        {doctor.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="mr-2 h-4 w-4" />
                            {doctor.email}
                          </div>
                        )}
                      </div>

                      {doctor.clinic_name && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <div className="flex items-center text-sm text-blue-800 font-medium">
                            <Stethoscope className="mr-2 h-4 w-4" />
                            {doctor.clinic_name}
                          </div>
                          {doctor.clinic_address && (
                            <div className="flex items-center text-xs text-blue-700 mt-1">
                              <MapPin className="mr-1 h-3 w-3" />
                              {doctor.clinic_address}
                            </div>
                          )}
                          {doctor.consultation_fee && (
                            <div className="text-sm text-blue-800 mt-1">
                              Consultation Fee: {formatCurrency(doctor.consultation_fee)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(doctor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(doctor.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No doctors found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new doctor."}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Doctor
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;