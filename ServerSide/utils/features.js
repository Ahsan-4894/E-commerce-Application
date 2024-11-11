import jwt from "jsonwebtoken";
import pool from "../configuration/connectDB.js";
import { v2 as cloudinary } from "cloudinary";

export const sendToken = async (res, user, statusCode, message) => {
  try {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    res
      .status(statusCode)
      .cookie("loggedAdmin", token, {
        httpOnly: true,
      })
      .json({
        success: true,
        message,
      });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Token sending error",
    });
  }
};

export const deleteAllFilesFromCloudinary = (allPublicIds = []) => {
  console.log("All files has been deleted!");
};
export const uploadFilesToCloudinary = async (file = []) => {
  console.log("All files has been uoploaded!");
};

export const search = async (req, res) => {
  const client = await pool.connect();
  try {
    const { value, tablename } = req.body;
    if (!tablename)
      return res
        .status(404)
        .json({ success: false, message: "Please provide a table" });

    const { rows } = await client.query(
      `SELECT * FROM ${tablename} WHERE name LIKE $1`,
      [`%${value}%`]
    );

    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No result found" });

    const transformedRows = rows.map((row, index) => {
      return {
        id: index,
        ...row,
      };
    });
    return res.status(200).json({ success: true, message: transformedRows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred" });
  }
};

export const uploadFileToCloudinary = async (files = []) => {
  const uploadAllFilesPromises = files.map(async (file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file,
        {
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadAllFilesPromises);
    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));

    return formattedResults;
  } catch (error) {
    console.log(error);
  }
};
