import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (curl, server-to-server, health checks) with no origin header
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check

// Root
app.get("/", (_req, res) => {
  res.json({ success: true, message: "Ozone Backend Running 🚀" });
});
// All API routes
const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`running on port ${port}`));
app.use("/api", routes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
| Must be registered LAST, after all routes and the 404 handler, and must
| take all 4 params (err, req, res, next) so Express recognizes it as an
| error handler. Without this, errors passed via next(err) - e.g. multer's
| fileFilter rejecting a file type, or file-size limit errors - fall
| through to Express's default handler, which returns a raw HTML 500 page
| instead of the JSON shape the frontend expects.
*/
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);

  res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong.",
  });
});

export default app;
