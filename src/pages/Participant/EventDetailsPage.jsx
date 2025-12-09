import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import "../../css/EventDetailsPage.css";
// Ensure you have this hook created or import 'auth' directly if you don't use a context
import { useAuth } from "../../components/AuthContext"; 

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current user from your Auth Context
  const { user } = useAuth();

  const formatDate = (dateObj) => {
    if (!dateObj) return "Date not specified";
    if (dateObj.seconds) {
      return new Date(dateObj.seconds * 1000).toLocaleDateString();
    }
    return dateObj;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
        } else {
          setEvent(null);
        }
      } catch (error) {
        console.error("Failed to load event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // --- FIXED FUNCTION ---
  // removed the 'e' or 'event' argument so it doesn't shadow the state variable
  const handleRegistration = async () => {
    
    if (!user) {
        alert("You must be logged in to register.");
        return;
    }

    try {
      console.log("Initiating payment for Event ID:", event.id); // Now correctly logs the ID

      const functionUrl = "https://us-central1-ezevent-b494c.cloudfunctions.net/createStripeCheckout";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id, // Uses the 'event' from useState
          userId: user.uid,
          userEmail: user.email
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL returned from backend", data);
        alert("Payment system is currently unavailable.");
      }

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Could not connect to payment server.");
    }
  }

  if (loading) return <p>Loading event details...</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <div className="event-details-page-container">
      <div className="event-details-card">

        <div className="top-actions-bar">
          <button onClick={() => navigate(-1)} className="back-button">
            ⬅ Back
          </button>
        </div>

        <h1>{event.eventName}</h1>

        <div className="event-content-grid">

          <div className="main-info">
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.eventName}
                className="event-image"
              />
            )}

            <div className="info-row">
              <h3>Category</h3>
              <p>{event.category || "Category not specified"}</p>
            </div>

            <div className="info-row">
              <h3>Event Name</h3>
              <p>{event.eventName}</p>
            </div>

            <div className="info-row">
              <h3>Date</h3>
              <p>{formatDate(event.date)}</p>
            </div>

            <div className="info-row">
              <h3>Description</h3>
              <p>{event.description}</p>
            </div>

            <div className="info-row">
              <h3>Faculty</h3>
              <p>{event.faculty || "Faculty not specified"}</p>
            </div>

            <div className="info-row">
              <h3>University</h3>
              <p>{event.university || "University not specified"}</p>
            </div>

            <div className="info-row">
              <h3>Price</h3>
              <p>{event.price || "Price not specified"}</p>
            </div>

            <div className="info-row">
              <h3>Location</h3>
              <p>{event.address || "Location not specified"}</p>
            </div>

          </div>
        </div>

        <button onClick={handleRegistration} className="register-event-button">
          Register for Event
        </button>

      </div>
    </div>
  );
}