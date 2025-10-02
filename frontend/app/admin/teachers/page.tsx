'use client'

import { useState, useEffect } from 'react';
import { adminAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Award,
  Eye
} from 'lucide-react';

interface Teacher {
  _id: string;
  name: string;
  bio: string;
  specializations: string[];
  experience: number;
  certifications: string[];
  email: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
}

const TeachersAdmin = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getAllYogaTeachers();
      const data = response.data;
      if (data.success) {
        setTeachers(data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await adminAPI.deleteYogaTeacher(teacherId);
      await fetchTeachers();
      toast.success('Teacher deleted successfully!');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to delete teacher. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
              <p className="text-gray-600">Manage your yoga instructors and teacher trainers</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Teacher
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{teachers.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {teachers.filter(t => t.isActive).length}
                </p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Experience</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + t.experience, 0) / teachers.length) : 0}y
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Specializations</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {Array.from(new Set(teachers.flatMap(t => t.specializations))).length}
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div key={teacher._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {teacher.profileImage ? (
                      <img
                        src={teacher.profileImage}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium text-gray-700">
                        {teacher.name[0]}
                      </span>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">{teacher.experience} years experience</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{teacher.bio}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {teacher.email}
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {teacher.phone}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-1">
                    {teacher.specializations.slice(0, 3).map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                    {teacher.specializations.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{teacher.specializations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {teacher.certifications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
                    <p className="text-xs text-gray-600">
                      {teacher.certifications.length} certification{teacher.certifications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    {teacher.socialMedia?.instagram && (
                      <a
                        href={teacher.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-500"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.987 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.35-1.052-2.35-2.35s1.052-2.35 2.35-2.35 2.35 1.052 2.35 2.35-1.053 2.35-2.35 2.35zm7.718 0c-1.297 0-2.35-1.052-2.35-2.35s1.052-2.35 2.35-2.35 2.35 1.052 2.35 2.35-1.053 2.35-2.35 2.35z"/>
                        </svg>
                      </a>
                    )}
                    {teacher.socialMedia?.website && (
                      <a
                        href={teacher.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"/>
                        </svg>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingTeacher(teacher);
                        setShowModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {teachers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first teacher.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Teacher
            </button>
          </div>
        )}

        {/* Teacher Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingTeacher(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <TeacherForm
                  teacher={editingTeacher}
                  onSubmit={async (teacherData) => {
                    try {
                      if (editingTeacher) {
                        await adminAPI.updateYogaTeacher(editingTeacher._id, teacherData);
                        toast.success('Teacher updated successfully!');
                      } else {
                        await adminAPI.createYogaTeacher(teacherData);
                        toast.success('Teacher created successfully!');
                      }

                      await fetchTeachers();
                      setShowModal(false);
                      setEditingTeacher(null);
                    } catch (error) {
                      console.error('Error saving teacher:', error);
                      toast.error('Failed to save teacher. Please try again.');
                    }
                  }}
                  onCancel={() => {
                    setShowModal(false);
                    setEditingTeacher(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Teacher Form Component
const TeacherForm = ({ teacher, onSubmit, onCancel }: {
  teacher: Teacher | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: teacher?.name || '',
    bio: teacher?.bio || '',
    specializations: teacher?.specializations || [''],
    experience: teacher?.experience || 0,
    certifications: teacher?.certifications || [''],
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    socialMedia: {
      instagram: teacher?.socialMedia?.instagram || '',
      facebook: teacher?.socialMedia?.facebook || '',
      website: teacher?.socialMedia?.website || ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      specializations: formData.specializations.filter(s => s.trim() !== ''),
      certifications: formData.certifications.filter(c => c.trim() !== '')
    });
  };

  const addSpecialization = () => {
    setFormData(prev => ({
      ...prev,
      specializations: [...prev.specializations, '']
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
          <input
            type="number"
            required
            min="0"
            max="50"
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          required
          rows={4}
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
        {formData.specializations.map((spec, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={spec}
              onChange={(e) => {
                const newSpecs = [...formData.specializations];
                newSpecs[index] = e.target.value;
                setFormData(prev => ({ ...prev, specializations: newSpecs }));
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Hatha Yoga"
            />
            {formData.specializations.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const newSpecs = formData.specializations.filter((_, i) => i !== index);
                  setFormData(prev => ({ ...prev, specializations: newSpecs }));
                }}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSpecialization}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Specialization
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
        {formData.certifications.map((cert, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={cert}
              onChange={(e) => {
                const newCerts = [...formData.certifications];
                newCerts[index] = e.target.value;
                setFormData(prev => ({ ...prev, certifications: newCerts }));
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., RYT-500"
            />
            {formData.certifications.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const newCerts = formData.certifications.filter((_, i) => i !== index);
                  setFormData(prev => ({ ...prev, certifications: newCerts }));
                }}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addCertification}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Certification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <input
            type="url"
            value={formData.socialMedia.instagram}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialMedia: { ...prev.socialMedia, instagram: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://instagram.com/username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
          <input
            type="url"
            value={formData.socialMedia.facebook}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialMedia: { ...prev.socialMedia, facebook: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://facebook.com/username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={formData.socialMedia.website}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialMedia: { ...prev.socialMedia, website: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {teacher ? 'Update Teacher' : 'Add Teacher'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TeachersAdmin;