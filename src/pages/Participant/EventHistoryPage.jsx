import React from "react";
import EventsList from "../../components/EventsList";
import { useAuth } from "../../components/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/EventDetailsPage.css";

export default function EventHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleClick = (event) => {
    navigate(`/participant/history/receipt/${event.id}`);
};

  return (
    <div className="participant-container">
      <main className="participant-content">
        <div className="participant-header">
          <div className="participant-profile">
            <h1>My Event History</h1>
          </div>
          <div className="participant-divider"></div>
        </div>

        <div className="participant-main">
          <EventsList
            collectionName="events"
            onClickAction={handleClick}
            ActionText="View Details"
            userRole="participant"
            userId={user ? user.uid : ""}
          />
        </div>
      </main>
    </div>
  );
}