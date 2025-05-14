import { useState, useEffect } from "react";
import SidebarWithBurgerMenu from "./components/navbar/drawer.jsx";
import MeetingRooms from "./components/body/carousel.jsx";
import PopupRoom from "./components/body/popupRoom.jsx";

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRoomTitle, setSelectedRoomTitle] = useState("");
  const [selectedRoomImages, setSelectedRoomImages] = useState([]); // New state for images
  const [meetingRoomsData, setMeetingRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleReserveClick = (title, images) => {
    setSelectedRoomTitle(title);
    setSelectedRoomImages(images); // Set images when reserving
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedRoomTitle("");
    setSelectedRoomImages([]); // Clear images on close
  };

  useEffect(() => {
    const fetchMeetingRooms = async () => {
      try {
        const response = await fetch(
          "http://172.16.0.95:3001/api/meeting-rooms"
        );
        const data = await response.json();
        setMeetingRoomsData(data);
      } catch (error) {
        console.error("Error fetching meeting rooms data:", error);
      } finally {
        setLoading(false);
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

  return (
    <div className="bg-gray-100 w-full h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white flex justify-between items-center py-3 px-5 md:px-10 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            className="h-12 w-auto"
            src="https://bonchon.com.ph/storage/cms_images/F2y4LTagCiGIOr8Y1fHcQZeM5cOaE661oABy6ftT.png"
            alt="Bonchon Logo"
          />
          <h2 className="text-lg font-semibold text-black">Booking</h2>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto py-5 px-4 md:px-10">
        <div className="flex flex-wrap justify-center w-full lg:max-w-screen-2xl mx-auto">
          {meetingRoomsData.map((room, index) => (
            <MeetingRooms
              key={index}
              title={room.room_names}
              imgSrc={room.room_img}
              onReserve={() =>
                handleReserveClick(room.room_names, room.image_paths)
              }
            />
          ))}
        </div>

        {/* Popup */}
        <PopupRoom
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          title={selectedRoomTitle}
          imagePaths={selectedRoomImages} // Pass images to PopupRoom
        />
      </div>
    </div>
  );
}

export default App;
