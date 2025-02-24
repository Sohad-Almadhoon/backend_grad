import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

// Routes
import authRoutes from "./routes/auth.route.js";
import carRoutes from "./routes/car.route.js";
import orderRoutes from "./routes/order.route.js";
import cartRoutes from "./routes/cart.route.js";
import userRoutes from "./routes/user.route.js";
import reviewRoutes from "./routes/review.route.js";
import favoriteRoutes from "./routes/favorite.route.js";

// Middlewares
import errorHandler from "./middlewares/errorMiddleware.js";

// Environment Config
dotenv.config();

// Initialize App
const app = express();

// Middleware Setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Routes Setup
const routes = {
  "/api/auth": authRoutes,
  "/api/cars": carRoutes,
  "/api/favorites": favoriteRoutes,
  "/api/reviews": reviewRoutes,
  "/api/carts": cartRoutes,
  "/api/orders": orderRoutes,
  "/api/users": userRoutes,
};

Object.entries(routes).forEach(([path, route]) => {
  app.use(path, route);
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
