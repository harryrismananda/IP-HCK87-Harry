import { useState } from "react";
import http from "../helpers/http";
import { showError } from "../helpers/alert";
import Swal from "sweetalert2";

export const AddLanguageModal = ({ isOpen, onClose, onLanguageAdded }) => {
  const [formData, setFormData] = useState({
    name: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Language name is required'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await http({
        method: 'POST',
        url: '/languages',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        data: formData
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Language added successfully'
      });

      // Reset form
      setFormData({ name: "" });
      
      // Call callback to refresh parent data
      if (onLanguageAdded) {
        onLanguageAdded(response.data);
      }
      
      // Close modal
      onClose();
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add New Language</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Language Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter language name (e.g., French, Spanish)"
              className="input input-bordered w-full"
              disabled={loading}
              required
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Adding...
                </>
              ) : (
                'Add Language'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};