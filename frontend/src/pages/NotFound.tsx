
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon">
          <CalendarDays size={35} />
        </div>

        <h1>404</h1>
        <h2>Page Not Found</h2>

        <p>
          Sorry, the page you are looking for does not exist
          or may have been moved.
        </p>

        <Link to="/dashboard" className="primary-button">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
