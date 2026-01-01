import React, { useState, useEffect } from 'react';
import '../../css/EventDashboard.css';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";

export default function EventDashboard({ }) {
    const { id } = useParams(); // Matches route parameter :id
    const navigate = useNavigate();

    // --- State Management ---
    const [eventName, setEventName] = useState("Loading...");
    const [qrDocs, setQrDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attendanceStats, setAttendanceStats] = useState({
        totalAttendees: 0,
        totalAbsence: 0,
        attendancePercentage: "0.00%",
    });

    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState('dashboard'); // Used for button toggle

    // --- Data Calculation (Using current state values) ---
    // Note: This derived state is for display only; the actual calc happens in fetchAttendanceStats
    const totalParticipants = attendanceStats.totalAttendees + attendanceStats.totalAbsence;
    const currentAttendanceRate = totalParticipants > 0
        ? ((attendanceStats.totalAttendees / totalParticipants) * 100).toFixed(2) + "%"
        : "0.00%";

    // --- Authentication and Data Loading ---
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser && id) {
                // Load both event details and QR data
                fetchEventDetails(id);
                loadEventData(currentUser.uid, id);
                fetchAttendanceStats(id);
            } else {
                setQrDocs([]);
            }
        });
        return () => unsub();
    }, [id]);

    async function fetchAttendanceStats(currentEventId) {
        try {
            // 1. Get all registrations for this event
            const regQuery = query(collection(db, 'registrations'), where('eventId', '==', currentEventId));
            const regSnap = await getDocs(regQuery);

            // 2. Check attendance subcollection for each registration in parallel
            const statsPromises = regSnap.docs.map(async (regDoc) => {
                const attendanceSub = collection(db, 'registrations', regDoc.id, 'attendance');
                const attendanceSnap = await getDocs(attendanceSub);

                // Check if ANY document in the subcollection has status 'present'
                // We do NOT check eventId here because the subcollection doc 
                // doesn't have it (and the parent is already filtered by eventId).
                const isPresent = attendanceSnap.docs.some(doc => doc.data().status === 'present');

                return isPresent ? 'present' : 'absent';
            });

            // 3. Resolve all checks
            const results = await Promise.all(statsPromises);

            // 4. Calculate totals
            const presentCount = results.filter(status => status === 'present').length;
            const absentCount = results.filter(status => status === 'absent').length;

            const total = presentCount + absentCount;
            const percentage = total > 0
                ? ((presentCount / total) * 100).toFixed(2) + "%"
                : "0.00%";

            setAttendanceStats({
                totalAttendees: presentCount,
                totalAbsence: absentCount,
                attendancePercentage: percentage,
            });

        } catch (error) {
            console.error("Error fetching attendance stats:", error);
        }
    }

    async function fetchEventDetails(eventId) {

        const eventDocRef = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventDocRef);
        if (eventSnapshot.exists()) {
            const eventData = eventSnapshot.data();
            setEventName(eventData.eventName);
        } else {
            setEventName("Event Not Found");
        }
    }

    async function loadEventData(uid, currentEventId) {
        setLoading(true);

        try {
            // Load QR codes for the event
            const q = query(
                collection(db, 'QR'),
                where('userId', '==', uid),        // Matches index
                where('eventId', '==', currentEventId), // Matches index
                orderBy('createdAt', 'desc')       // Matches index
            );
            const snaps = await getDocs(q);
            const items = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
            setQrDocs(items);

        } catch (error) {
            console.error("Error loading event data:", error);
        } finally {
            setLoading(false);
        }
    }

    // --- JSX RENDER ---
    return (
        <div className="dashboard-container-tbhx">
            <div className="halftone-bg"></div>

            {/* Event Name Header */}
            <header className="event-header-tbhx">
                <h1 className="tbhx-header">Event <span className="text-glow">Dashboard</span></h1>
                <p className="current-event-name">{eventName}</p>
                <div className="header-accent"></div>
            </header>

            {/* --- Main Dashboard View --- */}
            {viewMode === 'dashboard' && (
                <div className="dashboard-main-content">
                    {/* Main Attendance Card */}
                    <div className="attendance-hero-card">
                        <span className="attendance-rate">{currentAttendanceRate}</span>
                        <span className="attendance-label">CURRENT ATTENDANCE</span>
                    </div>

                    {/* Stats Cards Row */}
                    <div className="stats-grid">
                        <div className="tbhx-card stats-card-tbhx">
                            <span className="stats-label">PRESENT</span>
                            <span className="stats-number text-glow-cyan">{attendanceStats.totalAttendees}</span>
                        </div>
                        <div className="tbhx-card stats-card-tbhx">
                            <span className="stats-label">ABSENT</span>
                            <span className="stats-number text-glow-red">{attendanceStats.totalAbsence}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-row-tbhx">
                <button className="tbhx-button" onClick={() => navigate(`/organizer/my-event/${id}/attendance-list`, { state: { eventName } })}>
                    ATTENDANCE LIST
                </button>
                <button className="tbhx-button" onClick={() => navigate(`/organizer/my-event/${id}/report`, { state: { eventName } })}>
                    GENERATE REPORT
                </button>
                <button className="tbhx-button secondary" onClick={() => setViewMode(viewMode === 'dashboard' ? 'qr' : 'dashboard')}>
                    {viewMode === 'dashboard' ? 'VIEW QR CODES' : 'BACK TO DASHBOARD'}
                </button>
            </div>

            {viewMode === 'qr' && (
                <div className="viewqr-container-tbhx">
                    <h2 className="tbhx-header">Event <span className="text-glow">QR Access</span></h2>

                    {loading && <div className="loading-message">INCOMING DATA...</div>}
                    {!loading && qrDocs.length === 0 && <div className="no-qrs">NO QR CODES GENERATED FOR THIS SECTOR.</div>}

                    <div className="qr-grid-tbhx">
                        {qrDocs.map((doc) => (
                            <div className="tbhx-card qr-item-tbhx" key={doc.id}>
                                {doc.imageQR ? (
                                    <img src={doc.imageQR} alt={`QR ${doc.id}`} />
                                ) : (
                                    <div className="qr-placeholder">NO DATA</div>
                                )}
                                <div className="qr-meta">ID: {doc.id.substring(0, 8)}...</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}