import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { useAuth } from "../../components/AuthContext";
import "../../css/ChatPage.css";

export default function ChatListPage() {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Get user's registrations
        const regQuery = query(
          collection(db, "registrations"),
          where("userId", "==", user.uid)
        );
        const regSnapshot = await getDocs(regQuery);
        const eventIds = regSnapshot.docs.map(doc => doc.data().eventId);

        if (eventIds.length > 0) {
          // 2. Get event details for those IDs
          const eventsSnapshot = await getDocs(collection(db, "events"));
          const eventsData = eventsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(event => eventIds.includes(event.id));
          
          setRegisteredEvents(eventsData);
        }
      } catch (error) {
        console.error("Error fetching chat list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  if (loading) return <div className="loading">Loading your chats...</div>;

  return (
    <div className="chat-list-container">
      <div className="participant-header">
        <h1>Event Messages</h1>
        <p>Select an event to chat with the organizer</p>
      </div>
      
      <div className="chat-grid">
        {registeredEvents.length === 0 ? (
          <div className="no-chats">
            <p>You haven't registered for any events yet.</p>
            <button onClick={() => navigate("/participant/events")}>Browse Events</button>
          </div>
        ) : (
          registeredEvents.map(event => (
            <div 
              key={event.id} 
              className="chat-card" 
              onClick={() => navigate(`/participant/chat/${event.id}`)}
            >
              <div className="chat-card-icon">💬</div>
              <div className="chat-card-info">
                <h3>{event.eventName}</h3>
                <p>Click to join the discussion</p>
              </div>
              <div className="chat-card-arrow">→</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}