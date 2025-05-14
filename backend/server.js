const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON request body


const config = {
  user: "sa",
  password: "b1@dmin2022",
  server: "172.16.200.215",
  database: "Booking_System",
  options: {
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbout: true,
    instancename: "SQLEXPRESS",
  },
  port: 1433,
};

let pool;

async function getConnection() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log("Database connected successfully.");
  }
  return pool;
}

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

// Fetch existing schedules
app.get("/api/meeting-rooms", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
          room_names, 
          room_img, 
          button_link,
          image_paths
      FROM [Booking_System].[dbo].[mtbl.rooms]
      ORDER BY room_names
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data");
  }
});

app.get("/api/meeting-rooms/reason", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT * FROM [Booking_System].[dbo].[mtbl.reason]
      ORDER BY [reason]
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error retrieving data" });
  }
});

app.get("/api/meeting-rooms/employees", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT [EmployeeID]
      ,[name]
      ,[JobTitle]
      ,[Department]
      FROM [Booking_System].[dbo].[vwEmployees]
      ORDER BY [name]
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error retrieving data" });
  }
});

app.get("/api/meeting-rooms/:roomType/:date", async (req, res) => {
  try {
    const date = req.params.date;
    const roomType = req.params.roomType;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("roomType", sql.NVarChar, roomType)
      .input("date", sql.Date, date).query(`
        SELECT [id], [room_name], [emp_name], [reason], [sched_date], 
               [sched_time_start], [sched_time_end]
        FROM [Booking_System].[dbo].[room_sched]
        WHERE room_name = @roomType AND sched_date = @date
        ORDER BY [sched_time_start]
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data");
  }
});

app.delete("/api/meeting-rooms/delete/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    const pool = await getConnection();
    const result = await pool.request().input("roomId", sql.Int, roomId).query(`
        DELETE FROM [Booking_System].[dbo].[room_sched]
        WHERE id = @roomId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Error deleting room:", err);
    res
      .status(500)
      .json({ message: "Error deleting room", error: err.message });
  }
});

// Insert new booking
app.post("/api/meeting-rooms/book", async (req, res) => {
  try {
    const {
      emp_name,
      room_name,
      reason,
      sched_date,
      sched_time_start,
      sched_time_end,
    } = req.body;

    if (
      !emp_name ||
      !room_name ||
      !sched_date ||
      !sched_time_start ||
      !sched_time_end
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validateAndFormatTime = (time) => {
      if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(time)) {
        throw new Error("Invalid time format. Expected HH:MM or HH:MM:SS");
      }

      const parts = time.split(":");
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parts[2] ? parseInt(parts[2]) : 0;

      if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59 ||
        seconds < 0 ||
        seconds > 59
      ) {
        throw new Error(
          "Invalid time value. Time must be between 00:00:00 and 23:59:59"
        );
      }

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    };

    const datePart = "1900-01-01"; // Dummy date for conversion
    const formatted_sched_time_start = `${datePart} ${sched_time_start}`;
    const formatted_sched_time_end = `${datePart} ${sched_time_end}`;
    if (formatted_sched_time_start >= formatted_sched_time_end) {
      return res
        .status(400)
        .json({ message: "Start time must be before end time" });
    }

    const pool = await getConnection();
    const request = pool.request();
    console.log("Formatted Start Time:", sched_time_start);
    console.log("Formatted End Time:", sched_time_end);
    request.input("emp_name", sql.NVarChar, emp_name);
    request.input("room_name", sql.NVarChar, room_name);
    request.input("reason", sql.NVarChar, reason);
    request.input("sched_date", sql.Date, sched_date);
    request.input("sched_time_start", formatted_sched_time_start);
    request.input("sched_time_end", formatted_sched_time_end);

    await request.query(`
      INSERT INTO [Booking_System].[dbo].[room_sched]
      (emp_name, room_name, reason, sched_date, sched_time_start, sched_time_end)
      VALUES (@emp_name, @room_name, @reason, @sched_date, @sched_time_start, @sched_time_end)
    `);

    res.status(201).json({ message: "Booking successful!" });
  } catch (err) {
    console.error("Error inserting booking:", err);
    res
      .status(500)
      .json({ message: "Error inserting booking", error: err.message });
  }
});

// Gracefully close database connection when the app is stopped
process.on("SIGINT", async () => {
  if (pool) {
    await pool.close();
    console.log("Database connection pool closed.");
  }
  process.exit(0);
});
