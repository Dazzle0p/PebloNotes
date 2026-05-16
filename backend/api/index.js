require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const serverless = require("serverless-http");

const { connectDB } = require("../src/config/database");

const authRoutes = require("../src/routes/auth.routes");
const notesRoutes = require("../src/routes/notes.routes");
const sharedRoutes = require("../src/routes/shared.routes");
const insightsRoutes = require("../src/routes/insights.routes");

const app = express();

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://peblo-notes-nine.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api/", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/shared", sharedRoutes);
app.use("/api/insights", insightsRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: err.message,
  });
});

const handler = serverless(app);

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 Backend running on http://localhost:${port}`);
  });
}

module.exports = handler;
