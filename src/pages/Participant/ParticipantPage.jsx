import React from "react";
import EventsList from "../../components/EventsList";
import { useAuth } from "../../components/AuthContext";
import {useNavigate} from "react-router-dom";
export default function ParticipantPage() {

  const navigate = useNavigate();
  const {user} = useAuth()

  const handleClick = async (event) => {
    console.log("Getting Event Details:", event.id);
    navigate(`/participant/events/${event.id}`);
  }

    

  return (
    <div className="participant-container">
      <main className="participant-content">
        <div className="participant-header">
          <div className="participant-profile">
            <h1>Available Events</h1>
          </div>
          <div className="participant-divider"></div>
        </div>

        <div className="participant-main">
          <EventsList
            collectionName="events"
            onClickAction={handleClick}
            ActionText="Details"
            userRole="participant"
            userId={user ? user.uid : ""}
          />
        </div>
      </main>
    </div>
  )

}