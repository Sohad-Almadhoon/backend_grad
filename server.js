import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.route.js";
import carRoutes from "./routes/car.route.js";
import orderRoutes from "./routes/order.route.js";
import cartRoutes from "./routes/cart.route.js";
import userRoutes from "./routes/user.route.js";
import reviewRoutes from "./routes/review.route.js";
import favoriteRoutes from "./routes/favorite.route.js";
import errorHandler from "./middlewares/errorMiddleware.js";

const app = express();
dotenv.config();
app.use(express.json());
app.use(bodyParser.json());

const routes = {
  "/api/auth": authRoutes,
  "/api/cars": carRoutes,
  "/api/favorites": favoriteRoutes,
  "/api/reviews": reviewRoutes,
  "/api/carts": cartRoutes,
  "/api/orders": orderRoutes,
  "/api/users": userRoutes,
};
Object.keys(routes).forEach((route) => app.use(route, routes[route]));

app.use(errorHandler);

app.listen(5000, () => {
  console.log("Backend server is running on port 5000!");
});
