import React from "react";
import "../css/EventCard.css";
import testImage from "../assets/icons/sample.jpg";

const formatDate = (dateObj) => {
  if (!dateObj) return "Date not specified";
  if (dateObj.seconds) {
    return new Date(dateObj.seconds * 1000).toLocaleDateString();
  }
  return dateObj; // Fallback if it's already a string
};

export default function EventCard({ event, onClick, userRole, buttonText = "Register" }) {

  return (
    <div className="tbhx-card event-card-tbhx">
      <div className="event-img-wrapper">
        <img src={event.Image || testImage} alt={event.eventName} />
        <div className="event-date-badge">
          {formatDate(event.date)}
        </div>
      </div>

      <div className="event-details">
        <h3 className="tbhx-header">{event.eventName}</h3>
        <p className="event-location">
          <span className="accent-text">📍</span> {event.universityId}
        </p>
        <p className="event-desc">{event.description}</p>

        <div className="event-stats">
          <div className="stat-item">
            <span className="stat-label">Price</span>
            <span className="stat-val">{event.price || "Free"}</span>
          </div>
          {(userRole === "organizer" || userRole === "admin") && (
            <div className="stat-item">
              <span className="stat-label">Status</span>
              <span className={`status-badge ${event.status?.toLowerCase()}`}>
                {event.status}
              </span>
            </div>
          )}
        </div>

        <button
          className="tbhx-button card-action"
          onClick={() => onClick(event)}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
