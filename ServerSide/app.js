import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import { corsOptions } from "./configuration/config.js";
import cookieParser from "cookie-parser";

import adminRoute from "./routes/admin.js";
import productsRoute from "./routes/products.js";

import { errorMiddleware } from "./middlewares/error.js";
import { search } from "./utils/features.js";

const app = express();

const PORT = process.env.PORT || 5000;

//using necessary middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

//Routes importing
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/products", productsRoute);

app.post("/api/v1/search", search);
app.get("/", (req, res) => {
  res.send("Kya hai?");
});

//middleware for error handling
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
