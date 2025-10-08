import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { showSuccess, showError } from "../../../services/notificationService";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle,
  Clock,
  Building2,
  Key,
  Settings as SettingsIcon,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

// Redux actions
import { fetchSettings, updateSettings } from "../../../store/slices/settingsSlice";

// Components
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";

// Custom hooks
import { useProfile } from "../../../hooks/useProfile";

const ProfilePage = () => {
  const dispatch = useDispatch();
  
  // Use custom profile hook
  const {
    profileData,
    updateProfile,
    uploadAvatar,
    getDisplayName,
    getInitials,
    isAdmin,
    isManager,
    formatJoinDate,
    formatLastLogin,
  } = useProfile();

  // Get company settings from Redux
  const settings = useSelector((state) => state.settings.settings);
  const settingsLoading = useSelector((state) => state.settings.loading);
  
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [localData, setLocalData] = useState(profileData);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Fetch settings on mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync local data with profile data
  useEffect(() => {
    setLocalData(profileData);
  }, [profileData]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Show preview immediately
      setAvatarPreview(URL.createObjectURL(file));
      
      try {
        // Upload to server
        await uploadAvatar(file);
        
        // Clear preview after successful upload
        setAvatarPreview(null);
        showSuccess("Profile Picture Updated", "Your profile picture has been updated successfully!", 4000);
        
        // Clear the file input so the same file can be selected again
        event.target.value = '';
      } catch (error) {
        console.error("Avatar upload failed:", error);
        setAvatarPreview(null);
        showError("Upload Failed", error.message || "Failed to upload profile picture. Please try again.", 5000);
        
        // Clear the file input on error
        event.target.value = '';
      }
    }
  };

  // Save profile changes
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const success = await updateProfile(localData);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Profile save failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setLocalData(profileData);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  // Password change functions
  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      showError("Current Password Required", "Please enter your current password.", 4000);
      return;
    }
    if (!passwordData.newPassword) {
      showError("New Password Required", "Please enter a new password.", 4000);
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showError("Password Too Short", "New password must be at least 8 characters long.", 4000);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Passwords Don't Match", "New passwords do not match. Please try again.", 4000);
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      showError("Same Password", "New password must be different from current password.", 4000);
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccess("Password Changed", "Your password has been changed successfully!", 4000);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordChange(false);
      } else {
        showError("Password Change Failed", result.message || "Failed to change password. Please try again.", 5000);
      }
    } catch (error) {
      showError("Password Change Failed", "Failed to change password. Please try again.", 5000);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    setShowPasswordChange(false);
  };

  // Profile tabs
  const profileTabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: SettingsIcon },
  ];


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Avatar Section */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden shadow-lg">
                {profileData.avatar ? (
                  <img
                    src={avatarPreview || profileData.avatar}
                    alt={getDisplayName()}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold">{getInitials()}</span>
                )}
              </div>
              
              {isEditing && (
                <label className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera size={20} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {getDisplayName()}
                </h1>
                {!settingsLoading && settings && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Synced
                    </span>
                  </div>
                )}
              </div>
              
                 <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                   <div className="flex items-center gap-1">
                     <Mail size={14} className="flex-shrink-0" />
                     <span className="truncate">{profileData.email}</span>
                   </div>
                   <div className="flex items-center gap-1 flex-shrink-0">
                     <Shield size={14} />
                     {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                   </div>
                   <div className="flex items-center gap-1 flex-shrink-0">
                     <Building2 size={14} />
                     <span className="truncate">{settings?.companyName || "StockPilot"}</span>
                   </div>
                 </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Calendar size={12} />
                  Joined {formatJoinDate()}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock size={12} />
                  Last login {formatLastLogin()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1 sm:flex-initial px-4 py-3 rounded-lg border border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 dark:border-gray-600 dark:!text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:hover:!text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 sm:flex-initial px-4 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                      borderColor: isLoading ? '#9ca3af' : '#3b82f6',
                      color: '#ffffff',
                      transition: 'background-color 0.2s ease',
                      transform: 'none',
                      boxShadow: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.borderColor = '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                        e.currentTarget.style.borderColor = '#3b82f6';
                      }
                    }}
                  >
                    <Save size={16} className="mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
                  style={{
                    backgroundColor: '#3b82f6',
                    borderColor: '#3b82f6',
                    color: '#ffffff',
                    transition: 'background-color 0.2s ease',
                    transform: 'none',
                    boxShadow: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.borderColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                >
                  <Edit3 size={16} className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              {profileTabs.map((tab) => {
                const IconComponent = tab.icon;
  return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <IconComponent size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "personal" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       First Name
                     </label>
                     {isEditing ? (
                       <Input
                         value={localData.firstName}
                         onChange={(e) => handleInputChange("firstName", e.target.value)}
                         placeholder="Enter your first name"
                         className="w-full"
                       />
                     ) : (
                       <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                         {profileData.firstName || "Not provided"}
                       </div>
                     )}
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Last Name
                     </label>
                     {isEditing ? (
                       <Input
                         value={localData.lastName}
                         onChange={(e) => handleInputChange("lastName", e.target.value)}
                         placeholder="Enter your last name"
                         className="w-full"
                       />
                     ) : (
                       <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                         {profileData.lastName || "Not provided"}
                       </div>
                     )}
                   </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={localData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email"
                        className="w-full"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                        {profileData.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={localData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                        {profileData.phone || "Not provided"}
      </div>
                    )}
      </div>

                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Security Settings
                </h3>
                
                <div className="space-y-6">
                  {/* Password Change Section */}
                  <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Lock size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Change Password
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Update your account password for better security
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none flex-shrink-0"
                        style={{
                          backgroundColor: '#3b82f6',
                          borderColor: '#3b82f6',
                          color: '#ffffff',
                          transition: 'background-color 0.2s ease',
                          transform: 'none',
                          boxShadow: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.borderColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                          e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                      >
                        {showPasswordChange ? "Cancel" : "Change Password"}
                      </button>
                    </div>

                    {showPasswordChange && (
                      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Current Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                              placeholder="Enter your current password"
                              className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("current")}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                              placeholder="Enter your new password"
                              className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("new")}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
      </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Must be at least 8 characters long
                          </p>
      </div>

                        {/* Confirm Password */}
        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                              placeholder="Confirm your new password"
                              className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("confirm")}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        {/* Password Change Actions */}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={cancelPasswordChange}
                            disabled={isChangingPassword}
                            className="flex-1 px-4 py-2 rounded-lg border border-blue-300 !text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:!text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 dark:border-gray-600 dark:!text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:hover:!text-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword}
                            className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: isChangingPassword ? '#9ca3af' : '#3b82f6',
                              borderColor: isChangingPassword ? '#9ca3af' : '#3b82f6',
                              color: '#ffffff',
                              transition: 'background-color 0.2s ease',
                              transform: 'none',
                              boxShadow: 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (!isChangingPassword) {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.borderColor = '#2563eb';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isChangingPassword) {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                e.currentTarget.style.borderColor = '#3b82f6';
                              }
                            }}
                          >
                            <Lock size={16} className="mr-2" />
                            {isChangingPassword ? "Changing..." : "Change Password"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Security Info */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={16} className="text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        Account Security
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your account is secured with role-based access control and encrypted passwords.
                    </p>
                  </div>

                  {/* Account Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Key size={16} className="text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Current Role
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Member Since
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatJoinDate()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preferences & Settings
                </h3>
                
                <div className="space-y-4">

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <SettingsIcon size={16} className="text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        System Settings
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Configure app-wide settings including theme, currency, and more.
                    </p>
                     <button
                       type="button"
                       onClick={() => window.location.href = "/settings?tab=system"}
                       className="px-3 py-2 rounded-lg text-sm flex items-center justify-center focus:outline-none focus:ring-0 focus:shadow-none active:shadow-none"
                       style={{
                         backgroundColor: '#3b82f6',
                         borderColor: '#3b82f6',
                         color: '#ffffff',
                         transition: 'background-color 0.2s ease',
                         transform: 'none',
                         boxShadow: 'none',
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.backgroundColor = '#2563eb';
                         e.currentTarget.style.borderColor = '#2563eb';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.backgroundColor = '#3b82f6';
                         e.currentTarget.style.borderColor = '#3b82f6';
                       }}
                     >
                       Open Settings
                     </button>
                  </div>
        </div>
      </div>
            )}
          </div>
      </div>
      </div>

      {isLoading && <LoadingOverlay />}
    </div>
  );
};

export default ProfilePage;
