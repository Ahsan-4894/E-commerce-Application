import express from "express";
const router = express.Router();

import ProductsController from "../controllers/products.js";

import { isLoggedInAdmin } from "../middlewares/isAuth.js";

//Public Routes
//all can view products
router.post("/getProducts", ProductsController.getProducts);
router.get("/getCategories", ProductsController.getCategories);

//protected Routes only admins can Add/Delete/Update products

// router.use(isLoggedInAdmin);

router.post("/addProduct", ProductsController.addProduct);

router.put("/updateProduct/:productId", ProductsController.updateProduct);

router.delete("/deleteProduct/:productId", ProductsController.deleteProduct);
export default router;
