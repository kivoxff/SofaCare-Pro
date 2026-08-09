import app = require("./app");
import connectDB = require("./config/database");
import environment = require("./config/env");

// Connect to the database
connectDB();

// Start the server
app.listen(environment.port, () => {
    console.log("Server is running at port", environment.port);
})