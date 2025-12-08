import React from "react";
import EventsList from "../components/EventsList";


export default function ViewEventsPage() { 

  const handleClick = (event) => {
    console.log("Event clicked:", event.id);
  }
  return (
    <div>
      <h1>View Events</h1>
      <EventsList
        collectionName="events"
        onClickAction={handleClick}
        ActionText="Register"
      />
    </div>
  )
}
