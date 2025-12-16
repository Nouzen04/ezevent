import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../components/AuthContext";
import "../../css/ReceiptPage.css";

export default function ReceiptPage() {
  const { id } = useParams(); // Event ID
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [regInfo, setRegInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceiptData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Event Details
        const eventSnap = await getDoc(doc(db, "events", id));
        
        // 2. Fetch specific Registration details for this user and event
        const regQuery = query(
          collection(db, "registrations"),
          where("eventId", "==", id),
          where("userId", "==", user?.uid)
        );
        const regSnapshot = await getDocs(regQuery);

        if (eventSnap.exists() && !regSnapshot.empty) {
          setData(eventSnap.id ? { id: eventSnap.id, ...eventSnap.data() } : null);
          setRegInfo(regSnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching receipt:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchReceiptData();
  }, [id, user]);

  if (loading) return <div className="loading">Generating Receipt...</div>;
  if (!data || !regInfo) return <div className="error">Receipt data not found.</div>;

  return (
    <div className="receipt-container">
      <div className="receipt-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <button className="print-btn-top" onClick={() => window.print()}>🖨️ Print PDF</button>
      </div>

      <div className="receipt-card">
        <div className="receipt-header">
          <div className="brand">
            <h2>EZ-EVENT</h2>
            <p>Official Payment Receipt</p>
          </div>
          <div className="status-badge-container">
            <span className="status-badge success">{regInfo.status?.toUpperCase()}</span>
          </div>
        </div>

        <div className="receipt-section">
          <label>Event Information</label>
          <h3 className="event-title">{data.eventName}</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span>Date</span>
              <p>{new Date(data.date?.seconds * 1000).toLocaleDateString()}</p>
            </div>
            <div className="detail-item">
              <span>Location</span>
              <p>{data.address || "Virtual/Campus"}</p>
            </div>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-section">
          <label>Payment Summary</label>
          <div className="payment-table">
            <div className="payment-row">
              <span>Transaction ID</span>
              <p className="mono">{regInfo.paymentId}</p>
            </div>
            <div className="payment-row">
              <span>Registration Date</span>
              <p>{new Date(regInfo.registeredAt?.seconds * 1000).toLocaleString()}</p>
            </div>
            <div className="payment-row">
              <span>Payment Method</span>
              <p>Stripe / Online Banking</p>
            </div>
            <div className="payment-row total">
              <span>Total Paid</span>
              <p>{regInfo.currency} {regInfo.amountPaid}</p>
            </div>
          </div>
        </div>

        <div className="receipt-footer">
          <p>Thank you for your registration!</p>
          <small>This is a computer-generated receipt and requires no signature.</small>
        </div>
      </div>
    </div>
  );
}