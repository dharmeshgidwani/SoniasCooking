const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");


dotenv.config();
connectDB();

const allowedOrigins = [
    "https://sonias-cooking.vercel.app"
]

const app = express();
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
