const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  return res.json("Backend Running");
});

app.listen("3000", () => {
  console.log("Server is running on port 3000");
});

const config = {
  user: "sa",
  password: "b1@dmin2022",
  server: "172.16.200.215",
  database: "Booking System",
  options: {
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbout: true,
    instancename: "SQLEXPRESS",
  },
  port: 1433,
};

app.get("/api/meeting-rooms", async (req, res) => {
  try {
    await sql.connect(config);

    // SQL query to fetch room details along with subcategories
    const result = await sql.query(`
      SELECT 
        r.room_names, 
        r.room_img, 
        r.button_link, 
        n.table_number
      FROM 
        [Booking System].[dbo].[mtbl.rooms] r
      LEFT JOIN 
        [Booking System].[dbo].[mtbl.numbers] n
      ON 
        r.room_names = n.table_names
      ORDER BY 
        r.room_names, n.table_number
    `); // Adjust table and column names as needed

    // Transform the result into a structured format
    const rooms = result.recordset.reduce((acc, row) => {
      // Find the existing room entry
      let room = acc.find((r) => r.room_names === row.room_names);

      if (!room) {
        // If the room doesn't exist, add it
        room = {
          room_names: row.room_names,
          room_img: row.room_img,
          button_link: row.button_link,
          subcategories: [],
        };
        acc.push(room);
      }

      // Add subcategory (if available) to the room's subcategories
      if (row.table_number) {
        room.subcategories.push(row.table_number);
      }

      return acc;
    }, []);

    res.json(rooms); // Send the structured data as JSON
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data");
  } finally {
    await sql.close(); // Close the connection
  }
});


app.get("/api/meeting-rooms/:date", async (req, res) => {
  try {
    const date = req.params.date; // Get the date parameter from the URL
    await sql.connect(config);
    const result = await sql.query`
      SELECT [room_names], [room_img], [button_link]
      FROM [Booking System].[dbo].[mtbl.rooms]
      WHERE [date] = ${date}; // Adjust the query based on your table structure
    `;
    res.json(result.recordset); // Send the data as JSON
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data");
  } finally {
    await sql.close(); // Close the connection
  }
});
