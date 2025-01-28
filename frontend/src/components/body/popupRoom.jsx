import "../css/calendar.css";
import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import Calendar from "react-calendar"; // Make sure to install react-calendar
import "react-calendar/dist/Calendar.css"; // Import calendar styles

const today = new Date();

const PopupRoom = ({ isOpen, onClose, title, subcategory }) => {
  if (!isOpen) return null;

  // Function to disable Saturdays and Sundays
  const tileDisabled = ({ date }) => {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6; // Disable Sunday (0) and Saturday (6)
  };

  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [selectedGuestCount, setSelectedGuestCount] = useState(""); // State for guest count
  const [selectedOption, setSelectedOption] = useState(""); // State for selected option
  const [selectedTime, setSelectedTime] = useState(""); // State for selected time

  const handleDateClick = async (value, event) => {
    const selectedDate = `${value.getFullYear()}-${String(
      value.getMonth() + 1
    ).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
    setSelectedDate(selectedDate); // Update the selectedDate state
    console.log(`Selected date: ${selectedDate}`); // Print the selected date to the console
    const response = await fetch(
      `http://localhost:3000/api/meeting-rooms/${selectedDate}` // Update the API URL
    );
    const data = await response.json();
    if (data.length === 0) {
      setError("No details found for the selected date.");
    } else {
      setDetails(data);
      setError(null);
    }
  };

  // Handle change for the dropdown
  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };

  // Handle selecting a time slot
  const handleTimeSlotClick = (time) => {
    setSelectedTime(time);
  };

  const timeSlots = [
    { time: "2-3", label: "2:00 PM - 3:00 PM" },
    { time: "3-4", label: "3:00 PM - 4:00 PM" },
    { time: "4-5", label: "4:00 PM - 5:00 PM" },
    { time: "6-7", label: "6:00 PM - 7:00 PM" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg w-11/12 md:w-3/4 lg:w-3/4 bg-[#f4f8f9] lg:h-fit md:h-fit h-5/6 overflow-auto">
        {/* Header */}
        <div className="w-full flex items-center p-5 bg-white shadow-sm rounded-t-lg gap-3">
          {/* Heading in the Center */}
          <div className="flex-grow text-center w-2/4">
            <h2
              className="text-lg md:text-xl lg:text-2xl font-bold truncate overflow-hidden whitespace-nowrap"
              title={`Booking for: ${title}`}
            >
              Booking for: {title}
            </h2>
          </div>

          {/* Close Button on the Right */}
          <div className="flex flex-none">
            <i
              onClick={onClose}
              className="lni lni-xmark text-red-500 cursor-pointer text-3xl"
              title="Close"
            ></i>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full p-5 flex flex-col lg:flex-row gap-5 justify-center">
          {/* Calendar Section */}
          <div className="w-full md:w-full lg:w-fit bg-white p-5 rounded-lg shadow-md flex items-center justify-center">
            <Calendar
              minDate={today}
              tileDisabled={tileDisabled}
              calendarType="gregory"
              defaultDate={today} // Set the current date as the default value
              onClickDay={(value, event) => handleDateClick(value, event)}
              className="custom-calendar"
            />
          </div>

          {/* Details Section */}
          <div className="w-full rounded-lg flex flex-col justify-between">
            {/* Details Content */}
            <div className="w-full pt-4">
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label
                    htmlFor="dropdown"
                    className="block text-sm md:text-base lg:text-lg font-medium text-gray-700"
                  >
                    Select Table Number:
                  </label>
                  <select
                    id="dropdown"
                    value={selectedOption}
                    onChange={handleSelectChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base lg:text-lg h-[42px]"
                  >
                    {subcategory.map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-1/2">
                  <label
                    htmlFor="guestCount"
                    className="block text-sm md:text-base lg:text-lg font-medium text-gray-700"
                  >
                    Number of Guests:
                  </label>
                  <input
                    id="guestCount"
                    type="number"
                    min="1"
                    value={selectedGuestCount}
                    onChange={(e) => setSelectedGuestCount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base lg:text-lg h-[42px]"
                    placeholder="Enter guests count"
                  />
                </div>
              </div>

              {/* Schedule Hours Section */}
              <div className="mt-6">
                <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800">
                  Select a Time Slot:
                </h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.time}
                      onClick={() => handleTimeSlotClick(slot.time)}
                      className={`cursor-pointer p-4 text-center border rounded-md transition duration-200 ease-in-out ${
                        selectedTime === slot.time
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 hover:bg-blue-200"
                      }`}
                    >
                      {slot.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex justify-end mt-4">
              <Button onClick={onClose} color="green" size="lg">
                Book
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupRoom;
