import Sidebar from "../components/Sidebar";
import { Routes, Route } from "react-router-dom";
import ViewEventsPage from "../pages/ViewEventPage";
import OrganizerPage from "../pages/Organizer/OrganizerPage";
import CreateEvent from "../pages/Organizer/CreateEventPage";
function OrganizerLayout() {
  return (
    <div className="organizer-container">
      <Sidebar role="organizer" />

      <div className="organizer-content">
        <Routes>
          <Route path="" element={<OrganizerPage />} />
          <Route path="my-events" element={<OrganizerPage />} />
          <Route path="create-event" element={<CreateEvent />} />
        </Routes>
      </div>
    </div>
  );
}

export default OrganizerLayout;
