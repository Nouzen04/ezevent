import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, getDoc, setDoc 
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../components/AuthContext";
import "../../css/ChatPage.css";

export default function EventChat() {
  const { eventId } = useParams(); 
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [eventData, setEventData] = useState(null);
  const scrollRef = useRef();

  // threadId is the eventId for shared chat
  const threadId = eventId;

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      const docSnap = await getDoc(doc(db, "events", eventId));
      if (docSnap.exists()) setEventData(docSnap.data());
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (authLoading || !user || !eventId || !threadId) return;

    // TARGET PATH: events/{eventId}/chats/{threadId}/messages
    const q = query(
      collection(db, "events", eventId, "chats", threadId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(allMsgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [eventId, user, authLoading, threadId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !threadId) return;

    try {
      const displayName = user.displayName || user.email.split('@')[0];

      // 1. Update the parent summary (What you see in Participant Inquiries)
      const chatDocRef = doc(db, "events", eventId, "chats", threadId);
      await setDoc(chatDocRef, {
        lastMessage: newMessage,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Add message document to the 'messages' sub-collection
      const messagesRef = collection(db, "events", eventId, "chats", threadId, "messages");
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.role === "organizer" ? "Organizer" : displayName,
        text: newMessage,
        createdAt: serverTimestamp()
      });

      setNewMessage("");
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  if (authLoading) return <div>Loading...</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h3>{eventData?.eventName || "Chat"}</h3>
      </div>
      <div className="messages-container">
        {messages.length === 0 && <p style={{textAlign: 'center', color: 'grey'}}>No messages yet.</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.senderId === user.uid ? "right" : "left"}`}>
            <div className={`message-bubble ${msg.senderId === user.uid ? "sent" : "received"}`}>
              <small>{msg.senderName}</small>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-input-area-container">
        <div className="input-row">
          <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  );
}