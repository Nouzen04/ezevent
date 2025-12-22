import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase";
import "../../css/EventDetailsPage.css";
import { useAuth } from "../../components/AuthContext";

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // To detect if we are in 'history' mode

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // Check if the current URL contains 'history' or 'receipt'
  const isHistoryMode = location.pathname.includes("history") || location.pathname.includes("receipt");

  const formatDate = (dateObj) => {
    if (!dateObj) return "DATE NOT SPECIFIED";
    if (dateObj.seconds) {
      return new Date(dateObj.seconds * 1000).toLocaleDateString();
    }
    return new Date(dateObj).toLocaleDateString();
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          const rawEvent = { id: eventSnap.id, ...eventSnap.data() };

          const catId = rawEvent.categoryId;
          const uniId = rawEvent.universityId;
          const facId = rawEvent.facultyId;

          let categoryDisplay = "SECTOR UNKNOWN";
          let uniDisplay = "LOCATION UNKNOWN";
          let facultyDisplay = "FACULTY UNKNOWN";

          // 1. Fetch Category
          if (catId) {
            const catSnap = await getDoc(doc(db, "eventCategories", catId));
            if (catSnap.exists()) categoryDisplay = catSnap.data().categoryName;
          }

          // 2. Fetch University
          if (uniId) {
            const uniSnap = await getDoc(doc(db, "universities", uniId));
            if (uniSnap.exists()) uniDisplay = uniSnap.data().universityName;
          }

          // 3. Fetch Faculty
          if (uniId && facId) {
            const facRef = doc(db, "universities", uniId, "faculties", facId);
            const facSnap = await getDoc(facRef);
            if (facSnap.exists()) facultyDisplay = facSnap.data().facultyName;
          }

          setEvent({
            ...rawEvent,
            categoryName: categoryDisplay,
            universityName: uniDisplay,
            facultyName: facultyDisplay
          });

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

  const handleRegistration = async () => {
    if (!user) {
      alert("UNAUTHORIZED ACCESS. PLEASE LOG IN.");
      return;
    }

    try {
      const functionUrl = "https://us-central1-ezevent-b494c.cloudfunctions.net/createStripeCheckout";
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: event.price || 0,
          eventId: event.id,
          userId: user.uid,
          userEmail: user.email
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("SYSTEM ERROR: " + response.statusText);
        return;
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("PAYMENT PROTOCOL OFFLINE.");
      }
    } catch (error) {
      alert("CONNECTION FAILURE.");
    }
  };


  const handleViewReceipt = () => {
    navigate(`/participant/history/receipt/ticket/${id}`);
  };

  if (loading) return (
    <div className="event-details-loading">
      <div className="halftone-bg"></div>
      <div className="loading-glitch">INCOMING DATA...</div>
    </div>
  );

  if (!event) return (
    <div className="event-details-error">
      <div className="halftone-bg"></div>
      <div className="error-glitch">SECTOR VOID. EVENT NOT FOUND.</div>
      <button onClick={() => navigate(-1)} className="tbhx-button">RETURN</button>
    </div>
  );

  return (
    <div className="ed-root">
      <div className="halftone-bg"></div>

      <div className="top-actions-bar">
        <button onClick={() => navigate(-1)} className="tbhx-button secondary back-button">
          &larr; BACK
        </button>
      </div>

      <div className="ed-header">
        <h1 className="tbhx-header"><span className="text-glow">{event.eventName}</span></h1>
        <div className="header-accent"></div>
      </div>

      <div className="ed-layout">
        <div className="ed-media-section">
          {event.Image ? (
            <div className="ed-image-container">
              <img src={event.Image} alt={event.eventName} className="ed-image" />
              <div className="image-glitch-overlay"></div>
            </div>
          ) : (
            <div className="ed-image-placeholder">NO VISUAL DATA</div>
          )}

          <div className="ed-price-tag tbhx-card">
            <span className="price-label">ENTRY CREDIT</span>
            <span className="price-amount text-glow-cyan">
              {event.price ? `RM ${event.price}` : "FREE"}
            </span>
          </div>
        </div>

        <div className="ed-info-section">
          <div className="tbhx-card ed-info-card">
            <div className="ed-row">
              <span className="ed-label">STATUS</span>
              <span className="ed-value text-glow">ACTIVE</span>
            </div>
            <div className="ed-row">
              <span className="ed-label">SECTOR</span>
              <span className="ed-value">{event.categoryName.toUpperCase()}</span>
            </div>
            <div className="ed-row">
              <span className="ed-label">DEPLOYMENT DATE</span>
              <span className="ed-value">{formatDate(event.date)}</span>
            </div>
            <div className="ed-row">
              <span className="ed-label">LOCATION</span>
              <span className="ed-value">{event.universityName.toUpperCase()}</span>
            </div>
            <div className="ed-row">
              <span className="ed-label">FACULTY</span>
              <span className="ed-value">{event.facultyName.toUpperCase()}</span>
            </div>
            <div className="ed-row">
              <span className="ed-label">COORDINATES</span>
              <span className="ed-value">{event.address || "SECTOR UNKNOWN"}</span>
            </div>
          </div>

          <div className="tbhx-card description-card">
            <span className="ed-label">MISSION OBJECTIVE</span>
            <p className="ed-description">{event.description}</p>
          </div>

          {isHistoryMode ? (
            <div className="tbhx-card message-card">
              <span className="ed-label">POST-REGISTRATION INTEL</span>
              <p className="ed-message">{event.afterRegistrationMessage || "NO ADDITIONAL INTEL."}</p>
              <button onClick={handleViewReceipt} className="tbhx-button ed-action-btn">
                VIEW TICKET & RECEIPT
              </button>
            </div>
          ) : (
            <button onClick={handleRegistration} className="tbhx-button ed-action-btn register-now">
              INITIALIZE REGISTRATION
            </button>
          )}
        </div>
      </div>
    </div>
  );
}