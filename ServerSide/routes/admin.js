import express from "express";
const router = express.Router();

import AdminController from "../controllers/admin.js";
import { isLoggedInAdmin } from "../middlewares/isAuth.js";
import {
  addCategoryValidator,
  loginValidator,
  validateHandler,
} from "../lib/validators.js";

//Public Routes
router.post("/login", loginValidator(), validateHandler, AdminController.login);
router.get("/logout", AdminController.logout);

//Protected Routes

// router.use(isLoggedInAdmin);
router.post(
  "/addCategory",
  addCategoryValidator(),
  validateHandler,
  AdminController.addCategory
);
router.post("/getUsers", AdminController.getAllUsers);

export default router;
