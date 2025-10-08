import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { showSuccess, showError } from "../services/notificationService";
import { setUser } from "../store/slices/authSlice";

export const useProfile = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  
  const [profileData, setProfileData] = useState({
    firstName: localStorage.getItem("firstName") || "",
    lastName: localStorage.getItem("lastName") || "",
    email: localStorage.getItem("userEmail") || "admin@example.com",
    avatar: localStorage.getItem("userAvatar") || "",
    role: localStorage.getItem("userRole") || "admin",
    phone: localStorage.getItem("phone") || "",
    joinDate: localStorage.getItem("userJoinDate") || "2024-01-01T00:00:00Z",
    lastLogin: localStorage.getItem("userLastLogin") || new Date().toISOString(),
  });

  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "firstName") {
        setProfileData(prev => ({ ...prev, firstName: e.newValue || "" }));
      }
      if (e.key === "lastName") {
        setProfileData(prev => ({ ...prev, lastName: e.newValue || "" }));
      }
      if (e.key === "userEmail") {
        setProfileData(prev => ({ ...prev, email: e.newValue || "" }));
      }
      if (e.key === "userAvatar") {
        setProfileData(prev => ({ ...prev, avatar: e.newValue || "" }));
      }
      if (e.key === "userRole") {
        setProfileData(prev => ({ ...prev, role: e.newValue || "admin" }));
      }
      if (e.key === "phone") {
        setProfileData(prev => ({ ...prev, phone: e.newValue || "" }));
      }
      if (e.key === "userJoinDate") {
        setProfileData(prev => ({ ...prev, joinDate: e.newValue || "" }));
      }
      if (e.key === "userLastLogin") {
        setProfileData(prev => ({ ...prev, lastLogin: e.newValue || "" }));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update profile data
  const updateProfile = async (newData) => {
    try {
      const updatedData = { ...profileData, ...newData };
      
      // Call backend API to update profile
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          email: updatedData.email,
          phone: updatedData.phone,
          profilePicture: updatedData.avatar,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile on server');
      }

      const result = await response.json();
      
      // Update localStorage with server response data (prefer server data over local data)
      const serverData = result.data || result;
      localStorage.setItem("firstName", serverData.firstName || updatedData.firstName);
      localStorage.setItem("lastName", serverData.lastName || updatedData.lastName);
      localStorage.setItem("userEmail", serverData.email || updatedData.email);
      localStorage.setItem("userAvatar", serverData.profilePicture || updatedData.avatar);
      localStorage.setItem("userRole", serverData.role || updatedData.role);
      localStorage.setItem("phone", serverData.phone || updatedData.phone);
      
      // Update the updatedData with server response
      const finalData = {
        ...updatedData,
        firstName: serverData.firstName || updatedData.firstName,
        lastName: serverData.lastName || updatedData.lastName,
        email: serverData.email || updatedData.email,
        avatar: serverData.profilePicture || updatedData.avatar,
        role: serverData.role || updatedData.role,
        phone: serverData.phone || updatedData.phone,
      };

      // Dispatch custom events for real-time sync
      window.dispatchEvent(new CustomEvent("userNameChanged", {
        detail: { userName: `${finalData.firstName} ${finalData.lastName}`.trim() || "Staff" }
      }));
      window.dispatchEvent(new CustomEvent("userAvatarChanged", {
        detail: { userAvatar: finalData.avatar }
      }));

      // Dispatch storage events to trigger same-tab updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'firstName',
        newValue: finalData.firstName,
        oldValue: profileData.firstName
      }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'lastName',
        newValue: finalData.lastName,
        oldValue: profileData.lastName
      }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'userEmail',
        newValue: finalData.email,
        oldValue: profileData.email
      }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'phone',
        newValue: finalData.phone,
        oldValue: profileData.phone
      }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'userAvatar',
        newValue: finalData.avatar,
        oldValue: profileData.avatar
      }));

      // Update local state
      setProfileData(finalData);

      // Update Redux state
      dispatch(setUser(finalData));

      showSuccess("Profile Updated", "Your profile has been updated successfully!", 4000);
      return true;
    } catch (error) {
      showError("Profile Update Failed", "Failed to update profile. Please try again.", 5000);
      return false;
    }
  };

  // Handle avatar upload
  const uploadAvatar = async (file) => {
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error("Only image files are allowed");
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB");
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/users/me/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload avatar');
      }

      const result = await response.json();
      const imageUrl = result.imageUrl || result.data?.profilePicture;

      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      // Update local storage and profile data
      localStorage.setItem("userAvatar", imageUrl);
      setProfileData(prev => ({ ...prev, avatar: imageUrl }));

      // Dispatch events for real-time sync
      window.dispatchEvent(new CustomEvent("userAvatarChanged", {
        detail: { userAvatar: imageUrl }
      }));

      window.dispatchEvent(new StorageEvent('storage', {
        key: 'userAvatar',
        newValue: imageUrl,
        url: window.location.href
      }));

      // Update Redux state
      if (dispatch) {
        dispatch(setUser({
          ...authUser,
          avatar: imageUrl
        }));
      }

      return imageUrl;
    } catch (error) {
      throw error;
    }
  };

  // Get user display name
  const getDisplayName = () => {
    const fullName = `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim();
    return fullName || "Staff";
  };

  // Get user initials
  const getInitials = () => {
    const firstName = profileData.firstName || "";
    const lastName = profileData.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "ST";
  };

  // Check if user is admin
  const isAdmin = () => {
    return profileData.role === "admin";
  };

  // Check if user is manager
  const isManager = () => {
    return profileData.role === "manager" || profileData.role === "admin";
  };

  // Format join date
  const formatJoinDate = () => {
    return new Date(profileData.joinDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format last login
  const formatLastLogin = () => {
    return new Date(profileData.lastLogin).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    profileData,
    updateProfile,
    uploadAvatar,
    getDisplayName,
    getInitials,
    isAdmin,
    isManager,
    formatJoinDate,
    formatLastLogin,
    authUser,
  };
};
