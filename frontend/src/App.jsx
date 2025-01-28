import { useState, useEffect } from "react";
import SidebarWithBurgerMenu from "./components/navbar/drawer.jsx";
import MeetingRooms from "./components/body/carousel.jsx";
import PopupRoom from "./components/body/popupRoom.jsx";

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRoomTitle, setSelectedRoomTitle] = useState("");
  const [meetingRoomsData, setMeetingRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleReserveClick = (title) => {
    setSelectedRoomTitle(title);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedRoomTitle(""); // Clear the title when closing
  };

  useEffect(() => {
    const fetchMeetingRooms = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/meeting-rooms");
        const data = await response.json();
        setMeetingRoomsData(data); // Assume `data` contains `room_names`, `room_img`, and `subcategories`
      } catch (error) {
        console.error("Error fetching meeting rooms data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchMeetingRooms();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (meetingRoomsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        No meeting rooms available.
      </div>
    );
  }

  // Get the subcategories of the selected room
  const selectedRoom = meetingRoomsData.find(
    (room) => room.room_names === selectedRoomTitle
  );
  const subcategories = selectedRoom?.subcategories || []; // Extract subcategories or default to empty array

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      {/* Header */}
      <div className="z-50 h-fit w-full bg-white flex justify-between items-center py-3 px-5 md:px-10 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            className="h-12 w-auto"
            src="./src/assets/img/frontlogo.png"
            alt="Bonchon Logo"
          />
          <h2 className="text-lg font-semibold">Booking</h2>
        </div>
        <SidebarWithBurgerMenu />
      </div>

      {/* Body */}
      <div className="flex flex-col justify-center items-center w-full h-full py-5 lg:py-20 px-4 md:px-10 overflow-hidden">
        <div className="flex flex-wrap justify-center w-full lg:max-w-screen-2xl">
          {meetingRoomsData.map((room, index) => (
            <MeetingRooms
              key={index}
              title={room.room_names}
              imgSrc={room.room_img}
              onReserve={handleReserveClick}
            />
          ))}
        </div>

        {/* Popup */}
        <PopupRoom
          isOpen={isPopupOpen}
          subcategory={subcategories} // Pass the filtered subcategories
          onClose={handleClosePopup}
          title={selectedRoomTitle}
        />
      </div>
    </div>
  );
}

export default App;
