
import { useEffect, useState } from "react";
import { Bell, Search, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const API_URL = "http://localhost:5000/api/admin-profile";
const SERVER_URL = "http://localhost:5000";

interface AdminProfile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  profilePicture: string | null;
}

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/calendar": "Calendar",
  "/schedules": "Manage Schedules",
  "/research": "Research Activities",
  "/panel-members": "Panel Members",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function Topbar() {
  const location = useLocation();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [imageError, setImageError] = useState(false);

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load administrator profile.");
      }

      const data = await response.json();

      setProfile(data.profile);
      setImageError(false);
    } catch (error) {
      console.error("Topbar profile error:", error);
    }
  };

  useEffect(() => {
    fetchAdminProfile();

    // Refresh after profile is updated in Settings
    const handleProfileUpdate = () => {
      fetchAdminProfile();
    };

    // Refresh when returning to the browser tab
    const handleWindowFocus = () => {
      fetchAdminProfile();
    };

    window.addEventListener(
      "admin-profile-updated",
      handleProfileUpdate
    );

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener(
        "admin-profile-updated",
        handleProfileUpdate
      );

      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const profileImage = profile?.profilePicture
    ? `${SERVER_URL}${profile.profilePicture}`
    : "";

  const initials = profile?.fullName
    ? profile.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
    : "AD";

  return (
    <header className="topbar">
      <div>
        <h2>{titles[location.pathname] || "Research Scheduler"}</h2>
        <p>NWU Research Scheduling Management System</p>
      </div>

      <div className="topbar-actions">
        

      

        <div className="admin-profile">
          <div className="avatar">
            {profileImage && !imageError ? (
              <img
                src={profileImage}
                alt={profile?.fullName || "Administrator"}
                onError={() => setImageError(true)}
              />
            ) : (
              <span>{profile ? initials : <UserCircle size={25} />}</span>
            )}
          </div>

          <div className="admin-profile-details">
  <strong>
    {profile?.fullName || "Loading profile..."}
  </strong>
</div>  
        </div>
      </div>
    </header>
  );
}
