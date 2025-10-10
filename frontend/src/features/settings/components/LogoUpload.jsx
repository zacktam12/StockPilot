import React, { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { showSuccess, showError } from '../../../services/notificationService';
import { useDispatch } from 'react-redux';
import { fetchSettings, updateLocalSetting, updateSettings } from '../../../store/slices/settingsSlice';
import { settingsAPI } from '../../../services/api';

const LogoUpload = ({ 
  currentLogo, 
  onLogoChange, 
  onLogoRemove,
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Invalid File Type', 'Please select an image file (PNG, JPG, GIF, etc.)', 4000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'File size must be less than 5MB', 4000);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadLogo(file);
  };

  // Upload logo to server
  const uploadLogo = async (file) => {
    setUploading(true);
    try {
      // Check authentication
      const authToken = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole');
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      if (userRole !== 'admin') {
        throw new Error('Only administrators can upload logos.');
      }
      
      const formData = new FormData();
      formData.append('logo', file);
      // Add timeout and more detailed logging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      const response = await settingsAPI.uploadLogo(formData);
      
      clearTimeout(timeoutId);
      if (response.data.success && response.data.data?.logoUrl) {
        // Update the form data immediately
        onLogoChange(response.data.data.logoUrl);
        
        // Update Redux store immediately for instant UI update
        dispatch(updateLocalSetting({ key: 'companyLogo', value: response.data.data.logoUrl }));
        
        // Refresh settings from server to ensure consistency
        dispatch(fetchSettings());
        
        showSuccess('Logo Uploaded', 'Company logo has been uploaded successfully!', 4000);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
            
      let errorMessage = 'Failed to upload logo';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to upload logos.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please select a smaller image.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError('Upload Failed', errorMessage, 5000);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  // Handle remove logo
  const handleRemoveLogo = async () => {
    setPreview(null);
    onLogoRemove();
    
    try {
      // Update Redux store immediately
      dispatch(updateLocalSetting({ key: 'companyLogo', value: '' }));
      
      // Update settings on server to remove logo
      await dispatch(updateSettings({ 
        endpoint: '/settings', 
        data: { companyLogo: '' } 
      }));
      
      showSuccess('Logo Removed', 'Company logo has been removed successfully', 4000);
    } catch (error) {
            showError('Remove Failed', 'Failed to remove logo. Please try again.', 5000);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  // Construct proper logo URL
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${logoPath}`;
  };

  const displayLogo = preview || getLogoUrl(currentLogo);


  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Company Logo
      </label>
      
      {/* Logo Display/Upload Area */}
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`
            relative border-2 border-dashed rounded-full w-32 h-32 flex items-center justify-center transition-all duration-300 group
            ${displayLogo 
              ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 shadow-md' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : displayLogo ? (
            <div className="relative w-full h-full">
              <img
                src={displayLogo}
                alt="Company Logo"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                                    e.target.style.display = 'none';
                  // Show fallback content
                  e.target.nextElementSibling.style.display = 'flex';
                }}
                onLoad={() => {
                }}
              />
              {/* Fallback content when image fails to load */}
              <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs text-center" style={{display: 'none'}}>
                <div>
                  <Image className="w-8 h-8 mx-auto mb-1" />
                  <div>Failed</div>
                </div>
              </div>
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLogo();
                  }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
                <Image className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          )}
          
          {/* Hover overlay for upload state */}
          {!displayLogo && !uploading && (
            <div className="absolute inset-0 bg-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-500" />
            </div>
          )}
        </div>
        
        {/* Text content outside the circle */}
        <div className="text-center">
          {uploading ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uploading logo...
            </p>
          ) : displayLogo ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click to change logo
            </p>
          ) : (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Company Logo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Click to upload or drag and drop
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
