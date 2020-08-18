const express = require("express");
const authRoutes = require("./routes/authRoutes");
const privateRoutes = require("./routes/privateRoutes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server, {
  path: "/api/socket",
});

let clientLang = "eng";

io.on("connection", (socket) => {
  console.log("Client connected. id: " + socket.id);

  io.emit("update:lang:fromServer", clientLang);

  socket.on("update:lang:fromClient", (lang) => {
    console.log("Socket language changed");
    clientLang = lang;
    io.emit("update:lang:fromServer", lang);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected. id: " + socket.id);
  });
});

dotenv.config();

// DB connection
mongoose.connect(
  process.env.DB_CONNECT,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    console.log(err ? err : "Connected to DB");
  }
);

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/user", authRoutes);
app.use("/api/private", privateRoutes);
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(5000, () => console.log("Server is running"));
