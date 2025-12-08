import React from 'react'
import Sidebar from '../../components/Sidebar'
import '../../css/AdminPage.css'
import EventCard from '../../components/EventCard'

export default function ParticipantPage() {
  return (
    <div className="admin-container">
      <Sidebar role="participant" />
      <main className="admin-content">
        <h1>ONGOING EVENT</h1>
        <EventCard event={{
          eventName: "Sample Event", 
          date: {seconds: 1711929600}, 
          facultyid: "Engineering", 
          description: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          }} 
          onClick={() => {}} 
          />
      </main>
    </div>
  )
}

