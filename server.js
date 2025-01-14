import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from './routes/auth.router.js';
import carRoutes from './routes/car.router.js';
import uploadRoutes from './routes/upload.route.js';
import orderRoutes from './routes/order.route.js';
import cartRoutes from './routes/cart.route.js';
import userRoutes from './routes/user.route.js';
import errorHandler from './middlewares/errorMiddleware.js';
const app = express();
dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true, 
  })
);

app.use(bodyParser.json());

const routes = {
  "/api/warmup": (_, res) => {
    res.send("Server is running")
  },
  "/api/auth": authRoutes,
  "/api/cars": carRoutes,
  "/api/upload": uploadRoutes,
  "/api/orders": orderRoutes,
  "/api/carts": cartRoutes,
  "/api/users": userRoutes,
};
Object.keys(routes).forEach((route) => app.use(route, routes[route]));


app.use(errorHandler);

app.listen(5000, () => {
  console.log("Backend server is running on port 5000!");
});
