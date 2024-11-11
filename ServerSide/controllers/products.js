import pool from "../configuration/connectDB.js";
import {
  deleteAllFilesFromCloudinary,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";

class ProductsController {
  static getProducts = async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { categoryName, typeName, status, name } = req.body;
      let query = `SELECT * FROM items WHERE 1=1`;
      const queryParams = [];

      // Dynamically add conditions based on the presence of each filter
      if (categoryName) {
        queryParams.push(categoryName);
        query += ` AND categoryName = $${queryParams.length}`;
      }
      if (typeName) {
        queryParams.push(typeName);
        query += ` AND typename = $${queryParams.length}`;
      }
      if (status) {
        queryParams.push(status === "stock" ? 1 : 0);
        if (status === "stock") {
          query += ` AND quantity > $${queryParams.length}`;
        } else if (status === "outofstock") {
          query += ` AND quantity = $${queryParams.length}`;
        }
      }
      if (name) {
        queryParams.push(`%${name}%`);
        query += ` AND name ILIKE $${queryParams.length}`; // ILIKE for case-insensitive search
      }

      const { rows: products } = await client.query(query, queryParams);
      if (products.length <= 0)
        return next(new ErrorHandler("No products found", 404));

      //fetch products images urls too!

      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      console.log(error);
      next(error);
    } finally {
      client.release();
    }
  };

  static addProduct = async (req, res, next) => {
    try {
      const client = await pool.connect();
      const { categoryName, name, price, quantity, typeName, adminId } =
        req.body;
      const files = req.files || [];

      //   const result = await uploadFilesToCloudinary(files);

      const [{ rows: categoryRows }, { rows: adminRows }] = await Promise.all([
        client.query(`SELECT * FROM categories WHERE name = $1`, [
          categoryName,
        ]),
        client.query(`SELECT * FROM admins WHERE id = $1`, [adminId]),
      ]);

      //Check if category exists or not
      if (categoryRows.length === 0)
        return next(new ErrorHandler("Category not found", 404));

      //Check if admin Exists
      if (adminRows.length === 0)
        return next(new ErrorHandler("Admin not found", 404));

      const { rows } = await client.query(
        `INSERT INTO Items (id, adminId, categoryName, name, price, quantity, typeName)
                            VALUES ($1,$2, $3, $4, $5, $6, $7) RETURNING *`,
        ["P111", adminId, categoryName, name, price, quantity, typeName]
      );

      return res.status(201).json({
        success: true,
        message: "Product added successfully",
      });
      //image to be uploaded on cloudinary later
    } catch (error) {
      console.log(error);
      if (error.code === "23505") {
        next(new ErrorHandler("Product already exists", 404));
      }
      next(error);
    }
  };

  static updateProduct = async (req, res, next) => {
    const client = await pool.connect();

    try {
      const { categoryName = null, name, price, quantity, typeName } = req.body;

      const { productId } = req.params;

      if (!productId) return next(new ErrorHandler("productId missing", 404));

      const promises = [
        client.query(`SELECT * FROM items WHERE id = $1`, [id]),
      ];
      if (categoryName)
        promises.push(
          client.query(`SELECT * FROM categories WHERE name = $1`, [
            categoryName,
          ])
        );

      const [{ rows: productRows }, { rows: categoryRows }] = await Promise.all(
        promises
      );
      if (productRows.length === 0)
        return next(new ErrorHandler("Product not found", 404));

      if (categoryName && categoryRows.length === 0)
        return next(new ErrorHandler("Category not found", 404));

      const queryParams = [];

      let query = `UPDATE items SET `;

      // Dynamically add conditions based on the presence of each adding criteria
      if (categoryName) {
        queryParams.push(categoryName);
        query += ` categoryname = $${queryParams.length}`;
      }
      if (typeName) {
        queryParams.push(typeName);
        query += ` typename = $${queryParams.length}`;
      }
      if (name) {
        queryParams.push(`${name}`);
        query += ` name = $${queryParams.length}`; // ILIKE for case-insensitive search
      }
      if (price && price > 0) {
        queryParams.push(price);
        query += ` price = $${queryParams.length}`;
      }
      if (quantity && quantity > 0) {
        queryParams.push(quantity);
        query += ` quantity = $${queryParams.length}`;
      }
      queryParams.push(id);
      query += ` WHERE id=$${queryParams.length}`;

      console.log(query);
      // Execute the query
      await client.query(query, queryParams);

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    } finally {
      client.release();
    }
  };

  static deleteProduct = async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { productId } = req.params;

      if (!productId) return next(new ErrorHandler("productId missing", 404));

      const { rows: productRows } = await client.query(
        `SELECT * FROM items WHERE id = $1`,
        [productId]
      );
      if (productRows.length === 0)
        return next(new ErrorHandler("Product not found", 404));

      //delete files from cloudinary
      // const result = deleteAllFilesFromCloudinary(productRows[0].url //or maybe something else//);

      await client.query(`DELETE FROM items WHERE id = $1`, [productId]);

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    } finally {
      client.release();
    }
  };

  static getCategories = async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { rows: categoryRows } = await client.query(
        `SELECT * FROM categories`
      );
      if (categoryRows.length === 0)
        return next(new ErrorHandler("Category not found", 404));

      const transformedCategoryRows = categoryRows.map((category, index) => ({
        id: index,
        ...category,
      }));
      return res.status(200).json({
        success: true,
        message: transformedCategoryRows,
      });
    } catch (error) {
      console.log(error);
      next(error);
    } finally {
      client.release();
    }
  };
}
export default ProductsController;
