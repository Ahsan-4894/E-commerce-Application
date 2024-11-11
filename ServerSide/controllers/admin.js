import pool from "../configuration/connectDB.js";

import { sendToken } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";

export default class AdminController {
  static login = async (req, res, next) => {
    const { email, password } = req.body;
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT * FROM Admins WHERE email = $1`,
        [email]
      );
      if (rows.length <= 0)
        return next(new ErrorHandler("User not found", 404));

      // const isPasswordSame = bcrypt.compare(password, rows[0].password);
      const isPasswordSame = password === rows[0].password;
      if (!isPasswordSame)
        return next(new ErrorHandler("Wrong Password Or Email", 401));

      const user = rows[0];
      sendToken(res, user, 200, "Login Success");
    } catch (error) {
      return res.status(500).json({ status: false, message: "Server Error" });
    } finally {
      client.release();
    }
  };

  static logout = async (req, res, next) => {
    const client = await pool.connect();
    try {
      res.clearCookie("loggedAdmin");
      res.status(200).json({
        success: true,
        message: "Admin Logged Out Successfully",
      });
    } catch (error) {
      next(error);
    } finally {
      client.release();
    }
  };

  static addCategory = async (req, res, next) => {
    const client = await pool.connect();

    try {
      const { name, slug, description } = req.body;
      const { rows } = await client.query(
        `SELECT * FROM categories WHERE name = $1`,
        [name]
      );
      if (rows.length > 0) {
        return next(new ErrorHandler("Category already exists", 400));
      }

      await client.query(
        `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)`,
        [name, slug, description]
      );

      return res.status(201).json({
        success: true,
        message: "Category added successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    } finally {
      client.release();
    }
  };

  static getAllUsers = async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { id = "", name = "" } = req.body;
      console.log(id, name);
      let queryParams = [];
      let query = `SELECT id, name, email, phonenumber FROM users WHERE 1=1`;
      if (id) {
        query += ` AND id=$1`;
        queryParams.push(id);
      }
      if (name) {
        queryParams.push(`%${name}%`);
        query += ` AND name LIKE $${queryParams.length} `;
      }
      if (!id && !name) {
        query = `SELECT id, name, email, phonenumber FROM users`;
      }

      const { rows } = await client.query(query, queryParams);

      if (rows.length === 0)
        return next(new ErrorHandler("No users found!", 404));

      const transformedRows = rows.map((row, index) => ({
        ...row,
      }));

      return res.status(200).json({
        success: true,
        message: transformedRows,
      });
    } catch (error) {
      console.log(error);
      next(error);
    } finally {
      client.release();
    }
  };
}
