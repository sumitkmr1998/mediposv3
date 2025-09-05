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
  Package,
  AlertTriangle,
  Calendar,
  DollarSign
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MedicineManagement = () => {
  // Get formatters from settings context
  const { formatCurrency, formatDate } = useFormatters();
  
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    manufacturer: "",
    batch_number: "",
    expiry_date: "",
    purchase_price: "",
    selling_price: "",
    stock_quantity: "",
    minimum_stock_level: "",
    description: ""
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(`${API}/medicines`);
      setMedicines(response.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting form data:", formData);
      
      // Convert string numbers to actual numbers
      const submitData = {
        ...formData,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        minimum_stock_level: parseInt(formData.minimum_stock_level) || 10
      };
      
      console.log("Processed submit data:", submitData);
      
      if (editingMedicine) {
        const response = await axios.put(`${API}/medicines/${editingMedicine.id}`, submitData);
        console.log("Update response:", response.data);
      } else {
        const response = await axios.post(`${API}/medicines`, submitData);
        console.log("Create response:", response.data);
      }
      
      await fetchMedicines();
      resetForm();
      alert("Medicine saved successfully!");
    } catch (error) {
      console.error("Error saving medicine:", error);
      console.error("Error response:", error.response?.data);
      alert("Error saving medicine: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await axios.delete(`${API}/medicines/${id}`);
        fetchMedicines();
      } catch (error) {
        console.error("Error deleting medicine:", error);
      }
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      generic_name: medicine.generic_name || "",
      manufacturer: medicine.manufacturer || "",
      batch_number: medicine.batch_number || "",
      expiry_date: medicine.expiry_date ? medicine.expiry_date.split('T')[0] : "",
      purchase_price: medicine.purchase_price.toString(),
      selling_price: medicine.selling_price.toString(),
      stock_quantity: medicine.stock_quantity.toString(),
      minimum_stock_level: medicine.minimum_stock_level.toString(),
      description: medicine.description || ""
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      generic_name: "",
      manufacturer: "",
      batch_number: "",
      expiry_date: "",
      purchase_price: "",
      selling_price: "",
      stock_quantity: "",
      minimum_stock_level: "",
      description: ""
    });
    setEditingMedicine(null);
    setShowAddForm(false);
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.generic_name && medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (medicine.manufacturer && medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStockStatus = (medicine) => {
    if (medicine.stock_quantity === 0) {
      return { status: "Out of Stock", color: "bg-red-100 text-red-800" };
    } else if (medicine.stock_quantity <= medicine.minimum_stock_level) {
      return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    }
    return { status: "In Stock", color: "bg-green-100 text-green-800" };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Medicine Management</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Medicine Management</h1>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search medicines..."
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
              {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Medicine Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="generic_name">Generic Name</Label>
                <Input
                  id="generic_name"
                  value={formData.generic_name}
                  onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="purchase_price">Purchase Price *</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="selling_price">Selling Price *</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="minimum_stock_level">Minimum Stock Level</Label>
                <Input
                  id="minimum_stock_level"
                  type="number"
                  value={formData.minimum_stock_level}
                  onChange={(e) => setFormData({ ...formData, minimum_stock_level: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMedicine ? "Update" : "Add"} Medicine
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Medicine List */}
      <div className="grid gap-4">
        {filteredMedicines.map((medicine) => {
          const stockStatus = getStockStatus(medicine);
          return (
            <Card key={medicine.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{medicine.name}</h3>
                        {medicine.generic_name && (
                          <p className="text-sm text-gray-600">
                            Generic: {medicine.generic_name}
                          </p>
                        )}
                        {medicine.manufacturer && (
                          <p className="text-sm text-gray-600">
                            Manufacturer: {medicine.manufacturer}
                          </p>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="mr-1 h-4 w-4" />
                          Stock: {medicine.stock_quantity}
                        </div>
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="mr-1 h-4 w-4" />
                          {formatCurrency(medicine.selling_price)}
                        </div>
                        <p className="text-xs text-gray-500">
                          Cost: {formatCurrency(medicine.purchase_price)}
                        </p>
                      </div>
                      {medicine.expiry_date && (
                        <div className="text-center">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="mr-1 h-4 w-4" />
                            Expires
                          </div>
                          <p className="text-xs">
                            {formatDate(new Date(medicine.expiry_date))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(medicine)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(medicine.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No medicines found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new medicine."}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;