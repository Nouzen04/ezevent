import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useLocation } from "react-router-dom"; 
import { db } from "../firebase";
import EventCard from "./EventCard";
import "../css/EventsList.css";

export default function EventsList({
    collectionName = "events",
    onClickAction,
    ActionText,
    userId,
    userRole
}) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation(); 

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            console.log("Fetching events for role:", userRole, "and userId:", userId);
            try {
                let eventsData = [];
                const eventsCollection = collection(db, "events");

                // --- 1. PARTICIPANT REGISTRATION PAGE CASE ---
                if (userRole === "participant" && location.pathname.includes("registration")) {
                    
                    const regQuery = query(
                        collection(db, "registrations"), 
                        where("userId", "==", userId)
                    );
                    const regSnapshot = await getDocs(regQuery);
                    const registeredEventIds = regSnapshot.docs.map(doc => doc.data().eventId);

                    if (registeredEventIds.length === 0) {
                        setEvents([]);
                        setLoading(false);
                        return;
                    }

                    const eventSnapshot = await getDocs(eventsCollection);
                    eventsData = eventSnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(event => registeredEventIds.includes(event.id));

                } 
                
                // --- 2. ALL OTHER CASES (Organizer, Admin, Participant on Home) ---
                else {
                    const snapshot = await getDocs(eventsCollection);
                    let rawEvents = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    // Logic: Organizer
                    // UPDATED: Changed from event.ownerId to event.userId based on your DB screenshot
                    if (userRole === "organizer") {
                        eventsData = rawEvents.filter(event => event.userId === userId);
                    }

                    // Logic: Participant (Available Events)
                    else if (userRole === "participant") {
                        const currentDate = new Date();
                        
                        eventsData = rawEvents.filter(event => {
                            const eventDate = new Date(event.date); 
                            return eventDate > currentDate; // Only show future events
                        });
                    }

                    // Logic: Admin (Show all)
                    else if (userRole === "admin") {
                        eventsData = rawEvents;
                    } 
                    
                    // Fallback
                    else {
                        eventsData = rawEvents;
                    }
                }

                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [collectionName, userId, userRole, location.pathname]); 

    if (loading) return <p>Loading events...</p>;

    return (
        <div className="events-container">
            {events.length === 0 ? (
                <p>No events found.</p>
            ) : (
                <div className="events-grid">
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onClick={onClickAction}
                            buttonText={ActionText}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}