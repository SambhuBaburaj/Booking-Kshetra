'use client'

import { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Fuel,
  CheckCircle,
  XCircle,
  Calendar,
  Settings,
  MapPin,
  IndianRupee,
  Eye,
  Filter,
  X
} from 'lucide-react';
import ImageUpload from '../../../components/ImageUpload';

interface Vehicle {
  _id: string;
  name: string;
  type: '2-wheeler' | '4-wheeler';
  category: 'scooter' | 'bike' | 'car' | 'suv';
  brand: string;
  vehicleModel: string;
  year: number;
  fuelType: 'petrol' | 'diesel' | 'electric';
  transmission: 'manual' | 'automatic';
  seatingCapacity: number;
  pricePerDay: number;
  images: string[];
  features: string[];
  description: string;
  specifications: {
    engine?: string;
    mileage?: string;
    fuelCapacity?: string;
    power?: string;
    torque?: string;
    topSpeed?: string;
  };
  availability: {
    isAvailable: boolean;
    availableFrom?: Date;
    availableTo?: Date;
  };
  location: {
    pickupLocation: string;
    dropLocation?: string;
  };
  insurance: {
    included: boolean;
    coverage?: string;
  };
  driverOption: {
    withDriver: boolean;
    withoutDriver: boolean;
    driverChargePerDay?: number;
  };
  depositAmount: number;
  termsAndConditions: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VehicleFormData {
  name: string;
  type: '2-wheeler' | '4-wheeler';
  category: 'scooter' | 'bike' | 'car' | 'suv';
  brand: string;
  vehicleModel: string;
  year: number;
  fuelType: 'petrol' | 'diesel' | 'electric';
  transmission: 'manual' | 'automatic';
  seatingCapacity: number;
  pricePerDay: number;
  images: string[];
  features: string[];
  description: string;
  specifications: {
    engine?: string;
    mileage?: string;
    fuelCapacity?: string;
    power?: string;
    torque?: string;
    topSpeed?: string;
  };
  availability: {
    isAvailable: boolean;
  };
  location: {
    pickupLocation: string;
    dropLocation?: string;
  };
  insurance: {
    included: boolean;
    coverage?: string;
  };
  driverOption: {
    withDriver: boolean;
    withoutDriver: boolean;
    driverChargePerDay?: number;
  };
  depositAmount: number;
  termsAndConditions: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
}

const initialFormData: VehicleFormData = {
  name: '',
  type: '2-wheeler',
  category: 'scooter',
  brand: '',
  vehicleModel: '',
  year: new Date().getFullYear(),
  fuelType: 'petrol',
  transmission: 'manual',
  seatingCapacity: 1,
  pricePerDay: 0,
  images: [],
  features: [],
  description: '',
  specifications: {
    engine: '',
    mileage: '',
    fuelCapacity: '',
    power: '',
    torque: '',
    topSpeed: ''
  },
  availability: {
    isAvailable: true
  },
  location: {
    pickupLocation: '',
    dropLocation: ''
  },
  insurance: {
    included: true,
    coverage: ''
  },
  driverOption: {
    withDriver: true,
    withoutDriver: true,
    driverChargePerDay: 0
  },
  depositAmount: 0,
  termsAndConditions: [],
  contactInfo: {
    phone: '',
    email: ''
  }
};

export default function AdminVehicleRentals() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | '2-wheeler' | '4-wheeler'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [newImage, setNewImage] = useState('');

  // Image upload state for new vehicles
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchVehicles();
  }, [typeFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No admin token found');
        return;
      }

      const url = typeFilter === 'all'
        ? 'http://localhost:5001/api/admin/vehicles'
        : `http://localhost:5001/api/admin/vehicles?type=${typeFilter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setVehicles(data.data.vehicles || []);
      } else {
        setError(data.message || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError('Failed to load vehicles');
      console.error('Vehicles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = () => {
    setEditingVehicle(null);
    setFormData(initialFormData);
    setPendingImages([]);
    setPendingImagePreviews([]);
    setShowModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      category: vehicle.category,
      brand: vehicle.brand,
      vehicleModel: vehicle.vehicleModel,
      year: vehicle.year,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      seatingCapacity: vehicle.seatingCapacity,
      pricePerDay: vehicle.pricePerDay,
      images: vehicle.images,
      features: vehicle.features,
      description: vehicle.description,
      specifications: { ...vehicle.specifications },
      availability: { ...vehicle.availability },
      location: { ...vehicle.location },
      insurance: { ...vehicle.insurance },
      driverOption: { ...vehicle.driverOption },
      depositAmount: vehicle.depositAmount,
      termsAndConditions: vehicle.termsAndConditions,
      contactInfo: { ...vehicle.contactInfo }
    });
    setShowModal(true);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setVehicles(vehicles.filter(v => v._id !== vehicleId));
      } else {
        setError(data.message || 'Failed to delete vehicle');
      }
    } catch (err) {
      setError('Failed to delete vehicle');
      console.error('Delete error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (editingVehicle) {
        // Update existing vehicle
        const response = await fetch(`http://localhost:5001/api/admin/vehicles/${editingVehicle._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          setVehicles(vehicles.map(v =>
            v._id === editingVehicle._id ? data.data : v
          ));
          setShowModal(false);
        } else {
          setError(data.message || 'Failed to update vehicle');
        }
      } else {
        // Create new vehicle
        const response = await fetch('http://localhost:5001/api/admin/vehicles', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          const newVehicle = data.data;

          // Upload pending images if any
          if (pendingImages.length > 0) {
            try {
              await uploadVehicleImages(newVehicle._id, pendingImages);
              // The uploadVehicleImages function already updates the local state
            } catch (imageError) {
              console.error('Failed to upload images for new vehicle:', imageError);
              setError('Vehicle created but failed to upload images. You can upload them later by editing the vehicle.');
            }
          }

          setVehicles([...vehicles, newVehicle]);
          setShowModal(false);
          setPendingImages([]);
          setPendingImagePreviews([]);
        } else {
          setError(data.message || 'Failed to create vehicle');
        }
      }
    } catch (err) {
      setError('Failed to save vehicle');
      console.error('Submit error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof VehicleFormData] as any),
          [child]: type === 'number' ? Number(value) :
                   type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) :
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addTerm = () => {
    if (newTerm.trim()) {
      setFormData(prev => ({
        ...prev,
        termsAndConditions: [...prev.termsAndConditions, newTerm.trim()]
      }));
      setNewTerm('');
    }
  };

  const removeTerm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.filter((_, i) => i !== index)
    }));
  };

  const uploadVehicleImages = async (vehicleId: string, files: File[]) => {
    try {
      const uploadFormData = new FormData();
      files.forEach(file => {
        uploadFormData.append('images', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/vehicles/admin/${vehicleId}/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const result = await response.json();

      if (result.success) {
        // Update the vehicle in local state
        setVehicles(prev => prev.map(v =>
          v._id === vehicleId
            ? { ...v, images: result.data.vehicle.images }
            : v
        ));

        // Update editing vehicle if it's the same one
        if (editingVehicle && editingVehicle._id === vehicleId) {
          setEditingVehicle(prev => prev ? { ...prev, images: result.data.vehicle.images } : null);
          setFormData(prev => ({ ...prev, images: result.data.vehicle.images }));
        }
      } else {
        throw new Error(result.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    (vehicle.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (vehicle.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (vehicle.vehicleModel?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const vehicleTypes = ['2-wheeler', '4-wheeler'];
  const categories = ['scooter', 'bike', 'car', 'suv'];
  const fuelTypes = ['petrol', 'diesel', 'electric'];
  const transmissionTypes = ['manual', 'automatic'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vehicle Rental Management</h1>
              <p className="text-gray-600 mt-1">Manage vehicle rentals for adventure sports</p>
            </div>
            <button
              onClick={handleCreateVehicle}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vehicles by name, brand, or model..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('2-wheeler')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                typeFilter === '2-wheeler'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              2-Wheeler
            </button>
            <button
              onClick={() => setTypeFilter('4-wheeler')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                typeFilter === '4-wheeler'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              4-Wheeler
            </button>
          </div>
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {vehicles.length === 0 ? 'No vehicles added yet' : 'No vehicles match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {vehicles.length === 0 ? 'Add your first vehicle to get started.' : 'Try adjusting your search terms.'}
            </p>
            {vehicles.length === 0 && (
              <button
                onClick={handleCreateVehicle}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.brand} {vehicle.vehicleModel} ({vehicle.year})
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {vehicle.availability.isAvailable ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        vehicle.availability.isAvailable ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {vehicle.availability.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Car className="w-4 h-4 mr-2" />
                      <span>{vehicle.type} - {vehicle.category}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{vehicle.seatingCapacity} passengers</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Fuel className="w-4 h-4 mr-2" />
                      <span>{vehicle.fuelType} - {vehicle.transmission}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <IndianRupee className="w-4 h-4 mr-2" />
                      <span>₹{vehicle.pricePerDay.toLocaleString()}/day</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{vehicle.location.pickupLocation}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditVehicle(vehicle)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit vehicle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Honda Activa"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {vehicleTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., Honda"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      placeholder="e.g., Activa 6G"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type *
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {fuelTypes.map(fuel => (
                        <option key={fuel} value={fuel}>
                          {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transmission *
                    </label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {transmissionTypes.map(transmission => (
                        <option key={transmission} value={transmission}>
                          {transmission.charAt(0).toUpperCase() + transmission.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seating Capacity *
                    </label>
                    <input
                      type="number"
                      name="seatingCapacity"
                      value={formData.seatingCapacity}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Day (₹) *
                    </label>
                    <input
                      type="number"
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deposit Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="depositAmount"
                      value={formData.depositAmount}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe the vehicle..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      name="location.pickupLocation"
                      value={formData.location.pickupLocation}
                      onChange={handleInputChange}
                      placeholder="e.g., Varkala Beach"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Drop Location (Optional)
                    </label>
                    <input
                      type="text"
                      name="location.dropLocation"
                      value={formData.location.dropLocation}
                      onChange={handleInputChange}
                      placeholder="e.g., Same as pickup"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="contactInfo.phone"
                      value={formData.contactInfo.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., +91 9876543210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="contactInfo.email"
                      value={formData.contactInfo.email}
                      onChange={handleInputChange}
                      placeholder="e.g., contact@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Driver Options */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="driverOption.withDriver"
                      checked={formData.driverOption.withDriver}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Available with driver
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="driverOption.withoutDriver"
                      checked={formData.driverOption.withoutDriver}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Available without driver
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver Charge per Day (₹)
                    </label>
                    <input
                      type="number"
                      name="driverOption.driverChargePerDay"
                      value={formData.driverOption.driverChargePerDay}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1">
                        <span className="text-sm text-blue-800">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Images</h3>

                {/* ImageKit Upload Component */}
                {editingVehicle ? (
                  // Existing vehicle - upload directly
                  <div className="mb-6">
                    <ImageUpload
                      variant="multiple"
                      label="Upload Vehicle Images"
                      placeholder="Upload multiple vehicle images (max 10 total)"
                      currentImageUrls={formData.images}
                      maxFiles={10 - formData.images.length}
                      onUpload={async (files: File[]) => {
                        await uploadVehicleImages(editingVehicle._id, files);
                      }}
                      maxSizeMB={5}
                    />
                  </div>
                ) : (
                  // New vehicle - store images temporarily
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">Note: Images will be uploaded when the vehicle is created.</p>
                    <ImageUpload
                      variant="multiple"
                      label="Select Vehicle Images"
                      placeholder="Select multiple vehicle images (max 10 total)"
                      currentImageUrls={pendingImagePreviews}
                      maxFiles={10}
                      onUpload={async (files: File[]) => {
                        // Store files for upload after creation
                        setPendingImages(prev => [...prev, ...files]);

                        // Create preview URLs
                        const newPreviews = files.map(file => URL.createObjectURL(file));
                        setPendingImagePreviews(prev => [...prev, ...newPreviews]);
                      }}
                      maxSizeMB={5}
                    />
                  </div>
                )}

                {/* Manual URL Input - Keep as fallback option */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="Or add image URL manually..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Current Images Display */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Vehicle image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      placeholder="Add a term or condition..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addTerm}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.termsAndConditions.map((term, index) => (
                      <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                        <span className="text-sm text-gray-800 flex-1">{term}</span>
                        <button
                          type="button"
                          onClick={() => removeTerm(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    // Clean up object URLs to prevent memory leaks
                    pendingImagePreviews.forEach(url => URL.revokeObjectURL(url));
                    setPendingImages([]);
                    setPendingImagePreviews([]);
                    setShowModal(false);
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Saving...' : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}