import { useState, useEffect } from "react";
import http from "../helpers/http";
import { showError, successProfilePicture } from "../helpers/alert";
import { useNavigate } from "react-router";


export const ProfilePage = () => {
  const navigate = useNavigate()
  const user_data = JSON.parse(localStorage.getItem("user_data") || '{}')
  
  // Check if user data exists, if not redirect to login
  useEffect(() => {
    if (!user_data.id || !localStorage.getItem("access_token")) {
      navigate('/login');
    }
  }, [navigate, user_data.id]);

  const [user, setUser] = useState({
    displayName: "",
    isPremium: false,
    profilePicture: ""
  });
  const [email, _setEmail] = useState(user_data.email || "");
  const [userProgress, setUserProgress] = useState([]);
  const [progressStats, setProgressStats] = useState({
    overallProgress: 0,
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

const fetchUserProfile = async () => {
    try {
      const response = await http({
        method: 'get',
        url: `/user/${JSON.parse(localStorage.getItem("user_data")).id}/profile`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      console.log('Fetched profile data:', response.data);
      setUser(response.data);
    } catch (error) {
      // If profile doesn't exist, create a default one
      if (error.message?.includes("Please input your profile information")) {
        setUser({
          displayName: user_data.fullName || "",
          isPremium: false,
          profilePicture: ""
        });
      } else {
        showError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateProgressStats = (progressData) => {
    if (!progressData || progressData.length === 0) {
      setProgressStats({
        overallProgress: 0,
        totalCourses: 0,
        completedCourses: 0,
        totalLessons: 0
      });
      return;
    }

    // Calculate stats based on the progress data
    const totalCourses = progressData.length;
    const completedCourses = progressData.filter(p => {
      // A course is considered completed if progress is 100 (as per requirement)
      if (p.progress && typeof p.progress === 'object') {
        return p.progress.completed === true || p.progress.percentage >= 100;
      }
      return false;
    }).length;

    // Calculate total lessons from all progress data
    const totalLessons = progressData.reduce((total, p) => {
      if (p.progress && p.progress.totalLessons) {
        return total + p.progress.totalLessons;
      }
      return total;
    }, 0);

    // Overall progress: if 100 = 1 course completed, then percentage = (completedCourses / totalCourses) * 100
    const overallProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

    setProgressStats({
      overallProgress,
      totalCourses,
      completedCourses,
      totalLessons
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
      }
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        showError('File size must be less than 2MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('imgUrl', selectedFile);
      
      const response = await fetch(`http://localhost:3000/user/${user_data.id}/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error response:', errorData);
        throw new Error(errorData.message || 'Failed to upload image');
      }
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      // Refresh the user profile to get the updated profile picture
      await fetchUserProfile();
      
      // Clear file selection
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Show success message
      successProfilePicture();
      
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const cancelImageSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await http({
          method: 'get',
          url: `/user/${JSON.parse(localStorage.getItem("user_data")).id}/profile`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          }
        });
        setUser(response.data);
      } catch (error) {
        // If profile doesn't exist, create a default one
        if (error.message?.includes("Please input your profile information")) {
          setUser({
            displayName: user_data.fullName || "",
            isPremium: false,
            profilePicture: ""
          });
        } else {
          showError(error);
        }
      }

      try {
        const response = await http({
          method: 'get',
          url: `/user/${JSON.parse(localStorage.getItem("user_data")).id}/progress`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          }
        });
        setUserProgress(response.data);
        calculateProgressStats(response.data);
      } catch (error) {
        console.error('Error fetching user progress:', error);
        setUserProgress([]);
        setProgressStats({
          overallProgress: 0,
          totalCourses: 0,
          completedCourses: 0,
          totalLessons: 0
        });
      }
      setLoading(false);
    };
    loadData();
  }, [user_data.fullName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await http({
        method: 'put',
        url: `/user/${user_data.id}/profile`,
        data: { displayName: user.displayName },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      setIsEditing(false);
      // Show success message
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };
  
  

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-2">
            My Profile
          </h1>
          <p className="text-base-content/60">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-primary text-primary-content rounded-full w-24 h-24 relative">
                    {previewUrl || user.profilePicture ? (
                      <img 
                        src={previewUrl || user.profilePicture} 
                        alt="Profile" 
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                    {/* Upload overlay when editing */}
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                <h2 className="card-title text-xl">
                  {user.displayName || user_data.fullName || 'User'}
                </h2>
                
                <p className="text-base-content/60 text-sm">
                  {email}
                </p>
                
                <div className="badge badge-lg mt-2">
                  {user.isPremium ? (
                    <span className="badge badge-success">Premium Member</span>
                  ) : (
                    <span className="badge badge-ghost">Free Member</span>
                  )}
                </div>

                {!user.isPremium && (
                  <button className="btn btn-primary btn-sm mt-4">
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="card-title text-xl">Profile Information</h3>
                  {!isEditing ? (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setIsEditing(false);
                          fetchUserProfile(); // Reset changes
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Display Name Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Display Name</span>
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={user.displayName}
                      onChange={handleChange}
                      className={`input input-bordered w-full ${!isEditing ? 'input-disabled' : 'focus:input-primary'}`}
                      placeholder="Enter your display name"
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Email Field (Read-only) */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      className="input input-bordered input-disabled w-full"
                      disabled
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Email cannot be changed
                      </span>
                    </label>
                  </div>

                  {/* Account Status */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Account Status</span>
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                      <div className={`badge ${user.isPremium ? 'badge-success' : 'badge-ghost'}`}>
                        {user.isPremium ? 'Premium' : 'Free'}
                      </div>
                      <span className="text-sm text-base-content/70">
                        {user.isPremium 
                          ? 'Enjoy unlimited access to all courses and features' 
                          : 'Upgrade to premium for unlimited access'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Profile Picture Upload */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Profile Picture</span>
                    </label>
                    
                    {/* File Input */}
                    <input
                      type="file"
                      className={`file-input file-input-bordered w-full ${!isEditing ? 'file-input-disabled' : ''}`}
                      accept="image/*"
                      disabled={!isEditing}
                      onChange={handleFileSelect}
                    />
                    
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        PNG, JPG up to 2MB
                      </span>
                    </label>

                    {/* Preview and Upload Controls */}
                    {selectedFile && isEditing && (
                      <div className="mt-4 p-4 bg-base-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {/* Preview Image */}
                          <div className="avatar">
                            <div className="w-16 h-16 rounded-full">
                              <img src={previewUrl} alt="Preview" className="rounded-full object-cover" />
                            </div>
                          </div>
                          
                          {/* File Info */}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-base-content/60">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className={`btn btn-primary btn-sm ${uploadingImage ? 'loading' : ''}`}
                              onClick={handleImageUpload}
                              disabled={uploadingImage}
                            >
                              {uploadingImage ? 'Uploading...' : 'Upload'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={cancelImageSelection}
                              disabled={uploadingImage}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="card-actions justify-end pt-4">
                      <button 
                        type="submit" 
                        className={`btn btn-primary ${saving ? 'loading' : ''}`}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Learning Progress */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Learning Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Progress</span>
                  <span className="text-sm font-semibold">{progressStats.overallProgress}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={progressStats.overallProgress} 
                  max="100"
                ></progress>
                
                <div className="stats stats-vertical lg:stats-horizontal shadow-sm">
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Languages</div>
                    <div className="stat-value text-lg">{progressStats.totalCourses}</div>
                    <div className="stat-desc text-xs">{progressStats.completedCourses} completed</div>
                  </div>
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Total Lessons</div>
                    <div className="stat-value text-lg">{progressStats.totalLessons || 'N/A'}</div>
                    <div className="stat-desc text-xs">across all languages</div>
                  </div>
                </div>
                
                {/* Progress breakdown by language */}
                {userProgress.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Progress by Language:</h4>
                    <div className="space-y-2">
                      {userProgress.map((progress, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-base-200 p-2 rounded">
                          <span>{progress.Language?.name || `Language ${progress.languageId}`}</span>
                          <span className={`badge badge-xs ${
                            progress.progress?.completed || progress.progress?.percentage >= 100 
                              ? 'badge-success' 
                              : 'badge-warning'
                          }`}>
                            {progress.progress?.completed || progress.progress?.percentage >= 100 
                              ? 'Completed' 
                              : 'In Progress'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Quick Actions</h3>
              <div className="space-y-3">
                {user_data.role === 'admin' && 
                <button className="btn btn-outline w-full justify-start" onClick={() => {
                  // Redirect to CMS
                  navigate('/cms/home');
                }}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Go To CMS
                </button>}
                
                <button className="btn btn-outline w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 01.5 17H6l4-4 4 4h5.5a2.5 2.5 0 01-2.5 2.5H4z" />
                  </svg>
                  Download Data
                </button>
                
                <button className="btn btn-outline btn-error w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
