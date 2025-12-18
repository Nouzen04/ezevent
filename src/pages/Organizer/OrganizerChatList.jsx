import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { useAuth } from "../../components/AuthContext";
import { 
  collection, 
  collectionGroup, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc 
} from "firebase/firestore";

export default function OrganizerChatList() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

useEffect(() => {
  const fetchThreads = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get all Event IDs that belong to THIS organizer
      const myEventsQuery = query(collection(db, "events"), where("userId", "==", user.uid));
      const myEventsSnap = await getDocs(myEventsQuery);
      
      const threadList = [];
      for (const eventDoc of myEventsSnap.docs) {
        const eventData = eventDoc.data();
        const eventId = eventDoc.id;
        
        // Check if chat exists
        const chatDocRef = doc(db, "events", eventId, "chats", eventId);
        const chatDocSnap = await getDoc(chatDocRef);
        const lastMessage = chatDocSnap.exists() ? chatDocSnap.data().lastMessage || "Click to view" : "No messages yet";
        
        threadList.push({
          id: eventId,
          eventId: eventId,
          eventName: eventData.eventName,
          lastMessage: lastMessage
        });
      }

      setThreads(threadList);
    } catch (err) {
      console.error("Error fetching threads:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchThreads();
}, [user.uid]);

  if (loading) return <div className="chat-list-container">Loading...</div>;

  return (
    <div className="chat-list-container">
      <h1>Event Chats</h1>
      <div className="chat-grid">
        {threads.map(thread => (
          <div key={thread.id} className="chat-card" onClick={() => navigate(`/organizer/chat/${thread.eventId}`)}>
            <div className="chat-card-info">
              <h3>{thread.eventName}</h3>
              <p>Event Chat</p>
              <small>Last: {thread.lastMessage}</small>
            </div>
            <div className="chat-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}