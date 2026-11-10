
import { useEffect, useState } from "react";
import {
  UserCircle,
  User,
  Mail,
  ShieldCheck,
  Pencil,
  Save,
  X,
  Camera,
  RefreshCw,
} from "lucide-react";
import "../styles/settings.css";

interface AdminProfile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  profilePicture: string | null;
}

const SERVER_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${SERVER_URL}/api/admin-profile`;

export default function Settings() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load profile.");
      }

      const currentProfile: AdminProfile = data.profile;

      setProfile(currentProfile);
      setFullName(currentProfile.fullName);
      setEmail(currentProfile.email);

      setPreview(
        currentProfile.profilePicture
          ? `${SERVER_URL}${currentProfile.profilePicture}`
          : ""
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image size must not exceed 3 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEdit = () => {
    if (!profile) return;

    setFullName(profile.fullName);
    setEmail(profile.email);
    setSelectedFile(null);
    setPreview(
      profile.profilePicture
        ? `${SERVER_URL}${profile.profilePicture}`
        : ""
    );
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!profile) return;

    setFullName(profile.fullName);
    setEmail(profile.email);
    setSelectedFile(null);
    setPreview(
      profile.profilePicture
        ? `${SERVER_URL}${profile.profilePicture}`
        : ""
    );
    setError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);

      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      const response = await fetch(API_URL, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setProfile(data.profile);
      setFullName(data.profile.fullName);
      setEmail(data.profile.email);
      setSelectedFile(null);
      setPreview(
        data.profile.profilePicture
          ? `${SERVER_URL}${data.profile.profilePicture}`
          : ""
      );

      setIsEditing(false);
      setSuccess("Your administrator profile has been updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <RefreshCw size={22} className="settings-spin" />
          <p>Loading administrator profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="settings-page">
        <div className="settings-card">
          <h2>Administrator Profile</h2>
          <p className="settings-error">
            {error || "Profile not found."}
          </p>
          <button className="settings-button primary" onClick={loadProfile}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your administrator profile.</p>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>Administrator Profile</h2>
            <p>Update your account information and profile picture.</p>
          </div>

          {!isEditing && (
            <button className="settings-button primary" onClick={handleEdit}>
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>

        <div className="settings-profile-section">
          <div className="settings-avatar-wrapper">
           {preview ? (
  <img
    src={preview}
    alt="Administrator profile"
    className="settings-avatar"
    onError={() => setPreview("")}
  />
) : (
  <div className="settings-avatar-placeholder">
    <UserCircle size={76} />
  </div>
)}

            {isEditing && (
              <label
                className="settings-camera-button"
                title="Change profile picture"
              >
                <Camera size={17} />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  hidden
                />
              </label>
            )}
          </div>

          <div className="settings-profile-info">
            <h3>{profile.fullName}</h3>
            <span className="settings-role-badge">
              <ShieldCheck size={14} />
              {profile.role}
            </span>
            {isEditing && (
              <p className="settings-photo-hint">
                JPG, PNG, or WEBP. Maximum file size: 3 MB.
              </p>
            )}
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-form">
          <div className="settings-field">
            <label htmlFor="fullName">Full Name</label>
            <div className="settings-input-wrapper">
              <User size={18} />
              <input
                id="fullName"
                type="text"
                value={fullName}
                disabled={!isEditing}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="email">Email Address</label>
            <div className="settings-input-wrapper">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                value={email}
                disabled={!isEditing}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="role">Account Role</label>
            <div className="settings-input-wrapper">
              <ShieldCheck size={18} />
              <input
                id="role"
                type="text"
                value={profile.role}
                disabled
              />
            </div>
          </div>
        </div>

        {error && <div className="settings-message error">{error}</div>}
        {success && (
          <div className="settings-message success">{success}</div>
        )}

        {isEditing && (
          <div className="settings-actions">
            <button
              className="settings-button secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={16} />
              Cancel
            </button>

            <button
              className="settings-button primary"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
