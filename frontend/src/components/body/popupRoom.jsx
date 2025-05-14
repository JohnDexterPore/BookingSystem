import React, { useState, useEffect } from "react";
import "../css/calendar.css";
import { Button } from "@material-tailwind/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const today = new Date();
const formattedDate = today.toISOString().split("T")[0];

const PopupRoom = ({ isOpen, onClose, title, imagePaths }) => {
  if (!isOpen) return null;

  const [selectedDate, setSelectedDate] = useState(formattedDate);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [reasons, setReasons] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const imagePathsArray = imagePaths.split(",");

  // Fetch room schedule when component mounts
  useEffect(() => {
    fetchSchedule(formattedDate);
  }, []);

  const fetchSchedule = async (date) => {
    try {
      const response = await fetch(
        `http://172.16.0.95:3001/api/meeting-rooms/${title}/${date}`
      );
      const data = await response.json();

      if (data.length === 0) {
        setSchedule([]);
        setError("No bookings found for the selected date.");
      } else {
        setSchedule(
          data.map((time) => {
            return {
              startTime: time.sched_time_start, // Keep as string
              endTime: time.sched_time_end,
              emp_name: time.emp_name,
              reason: time.reason,
              id: time.id,
            };
          })
        );

        setError(null);
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError("Failed to load schedule.");
    }
  };

  // Fetch reasons when the component mounts
  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const response = await fetch(
          "http://172.16.0.95:3001/api/meeting-rooms/reason"
        );
        const data = await response.json();
        setReasons(data.map((item) => item.reason)); // Extract reason values
      } catch (err) {
        console.error("Error fetching reasons:", err);
      }
    };

    fetchReasons();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          "http://172.16.0.95:3001/api/meeting-rooms/employees"
        );
        const data = await response.json();
        setEmployees(data); // Store employee data
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchEmployees();
  }, []);
  const handleDateClick = async (value) => {
    const nextDay = new Date(value);
    nextDay.setDate(nextDay.getDate() + 1); // Add one day
    const selectedDate = nextDay.toISOString().split("T")[0];
    setSelectedDate(selectedDate);
    fetchSchedule(selectedDate);
    generateTimeOptions();
  };

  // Handle change for the employee dropdown
  const handleEmployeeSelectChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  // Handle change for the reason dropdown
  const handleReasonSelectChange = (event) => {
    setSelectedReason(event.target.value);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";

    const date = new Date(timeString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const timeSlots = schedule.map((slot, index) => ({
    time: `${slot.startTime}-${slot.endTime}`, // Uses local time
    label: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`, // Displays correctly
    emp_name: slot.emp_name,
    reason: slot.reason,
    id: slot.id,
  }));

  // Function to generate time options
  const generateTimeOptions = (isTimeTo = false, timeFrom = null) => {
    const times = [];

    for (let hour = 7; hour <= 19; hour++) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      const timeString = `${displayHour}:00 ${ampm}`;
      const valueString = `${hour.toString().padStart(2, "0")}:00`;

      // Convert to timestamp
      let selectedTime = new Date(`1970-01-01T${valueString}:00Z`).getTime();

      // Adjust time by -1 second for Time To checks to prevent edge cases
      if (isTimeTo) {
        selectedTime -= 1000; // Reduce by 1 second
      }

      let isTaken = false;
      for (const slot of schedule) {
        const slotStart = new Date(slot.startTime).getTime();
        const slotEnd = new Date(slot.endTime).getTime();

        if (isTimeTo) {
          // "Time To" must be AFTER "Time From" and not inside another booking
          if (timeFrom) {
            const timeFromValue = new Date(
              `1970-01-01T${timeFrom}:00Z`
            ).getTime();
            if (
              selectedTime <= timeFromValue ||
              (selectedTime >= slotStart && selectedTime < slotEnd)
            ) {
              isTaken = true;
              break;
            }
          }
        } else {
          // "Time From" should not be inside an existing slot
          if (selectedTime >= slotStart && selectedTime < slotEnd) {
            isTaken = true;
            break;
          }
        }
      }

      times.push({
        display: timeString,
        value: valueString,
        disabled: isTaken,
      });
    }

    return times;
  };


  const handleBookRoom = async () => {
    if (
      !selectedEmployee ||
      !selectedDate ||
      !timeFrom ||
      !timeTo ||
      !selectedReason
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // Ensure times are in HH:MM:SS format
    const formatTime = (time) => {
      const parts = time.split(":");
      if (parts.length === 2) {
        return `${parts[0]}:${parts[1]}:00`;
      }
      return time;
    };

    const bookingData = {
      emp_name: selectedEmployee, // Employee ID from dropdown
      room_name: title, // Room name from popup props
      reason: selectedReason, // Reason from dropdown
      sched_date: selectedDate, // Selected date
      sched_time_start: formatTime(timeFrom), // Start time in HH:MM:SS
      sched_time_end: formatTime(timeTo), // End time in HH:MM:SS
    };

    try {
      const response = await fetch(
        "http://172.16.0.95:3001/api/meeting-rooms/book",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        onClose(); // Close popup after successful booking
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error booking room:", error);
      alert("Error booking room.");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!roomId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/meeting-rooms/delete/${roomId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete the room");
      }

      alert("Room deleted successfully!");
      onClose(); // Close popup after successful booking
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete the room.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 py-5">
      <div className="rounded-lg w-11/12 md:w-3/4 lg:w-3/4 bg-[#f4f8f9] h-[90vh] flex flex-col">
        <div className="w-full flex items-center p-5 bg-white shadow-sm rounded-t-lg gap-3">
          <div className="flex-grow text-center w-2/4">
            <h2 className="text-lg text-black md:text-xl lg:text-2xl font-bold truncate overflow-hidden whitespace-nowrap">
              Booking for: {title}
            </h2>
          </div>
          <div className="flex flex-none">
            <i
              onClick={onClose}
              className="lni lni-xmark text-red-500 cursor-pointer text-3xl"
              title="Close"
            ></i>
          </div>
        </div>

        <div className="w-full p-5 flex flex-wrap lg:flex-nowrap gap-4 flex-grow overflow-auto">
          {/* Carousel */}
          <div className="w-full lg:w-1/3 flex">
            <div className="carousel w-full h-full flex items-center">
              {imagePathsArray.map((imagePath, index) => (
                <div
                  key={index}
                  id={`slide${index + 1}`}
                  className="carousel-item relative w-full h-full"
                >
                  <img
                    src={imagePath}
                    className="w-full h-full object-cover rounded-lg"
                    alt={`Slide ${index + 1}`}
                  />
                  <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                    <a
                      href={`#slide${
                        index === 0 ? imagePathsArray.length : index
                      }`}
                      className="btn btn-circle"
                    >
                      ❮
                    </a>
                    <a
                      href={`#slide${
                        (index + 2) % imagePathsArray.length || 1
                      }`}
                      className="btn btn-circle"
                    >
                      ❯
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="w-full lg:w-2/3 flex flex-wrap content-start bg-white p-5 rounded-lg shadow-md">
            <p className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 w-full">
              Booking Form:
            </p>
            <div className="w-full lg:w-1/2 p-2 flex md:justify-center">
              <Calendar
                minDate={today}
                tileDisabled={({ date }) =>
                  date.getDay() === 0 || date.getDay() === 6
                }
                calendarType="gregory"
                defaultDate={today}
                onClickDay={handleDateClick}
                className="custom-calendar w-full h-full"
              />
            </div>
            <div className="w-full lg:w-1/2 p-2 flex flex-wrap gap-4">
              <div className="w-full">
                <label
                  htmlFor="employeeDropdown"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Employee:
                </label>
                <select
                  id="employeeDropdown"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="mt-1 bg-white text-black block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select an Employee --</option>
                  {employees.map((employee) => (
                    <option key={employee.EmployeeID} value={employee.name}>
                      {employee.name} - {employee.JobTitle} (
                      {employee.Department})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label
                  htmlFor="reasonDropdown"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Reason:
                </label>
                <select
                  id="reasonDropdown"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mt-1 bg-white text-black block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select a Reason --</option>
                  {reasons.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label
                  htmlFor="timeFrom"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time From:
                </label>
                <select
                  id="timeFrom"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="mt-1 bg-white text-black block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select Time --</option>
                  {generateTimeOptions().map(({ display, value, disabled }) => (
                    <option key={value} value={value} disabled={disabled}>
                      {display}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label
                  htmlFor="timeTo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time To:
                </label>
                <select
                  id="timeTo"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  disabled={!timeFrom}
                  className="mt-1 bg-white text-black block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select Time --</option>
                  {generateTimeOptions(true, timeFrom).map(
                    ({ display, value, disabled }) => (
                      <option
                        key={value}
                        value={value}
                        disabled={disabled || (timeFrom && value <= timeFrom)}
                      >
                        {display}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
            <div className="w-full flex flex-wrap bg-white mt-10">
              <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 w-full mb-5">
                Taken Time Slot:
              </h3>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 max-h-60 md:max-h-50 lg:max-h-40 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className="p-4 text-center border rounded-md bg-gray-300 text-gray-600 flex flex-wrap justify-center items-center"
                  >
                    <div className="w-2/3">
                      <p className="font-bold">{slot.label}</p>
                      <p className="text-sm text-gray-700 mb-3">
                        {slot.emp_name} - {slot.reason}
                      </p>
                    </div>
                    <div className="w-1/3">
                      <Button
                        onClick={() => {
                          handleDeleteRoom(slot.id);
                        }}
                        color="red"
                        size="lg"
                      >
                        <i className="lni lni-trash-3"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-fit flex justify-end p-5">
          <Button
            onClick={() => {
              handleBookRoom();
            }}
            color="green"
            size="lg"
          >
            Book
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PopupRoom;
