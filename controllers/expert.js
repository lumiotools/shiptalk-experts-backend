import fs from "fs";
import path from "path";
import pool from "../config/db.js";

const getProfilePictureUrl = (id) => `/api/experts/${id}/profile-picture`;

// Register a new expert
export const registerExpert = async (req, res) => {
  const {
    name,
    phone,
    linkedin,
    email,
    company,
    designation,
    years_in_industry,
  } = req.body;
  const profilePicture = req.file ? req.file.path : null;

  // Validate required fields
  if (
    !name ||
    !phone ||
    !linkedin ||
    !email ||
    !company ||
    !designation ||
    !years_in_industry ||
    !profilePicture
  ) {
    if (profilePicture) fs.unlinkSync(profilePicture); // Cleanup uploaded file if provided
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    // Check if email already exists
    const emailCheck = await pool.query(
      `SELECT * FROM experts WHERE email = $1`,
      [email]
    );
    if (emailCheck.rows.length > 0) {
      if (profilePicture) fs.unlinkSync(profilePicture); // Cleanup newly uploaded file
      return res.status(409).json({
        success: false,
        message: "This email is already registered with another expert.",
      });
    }

    // Insert new expert if email is unique
    const result = await pool.query(
      `INSERT INTO experts (name, phone, linkedin, email, company, designation, years_in_industry, profile_picture)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name,
        phone,
        linkedin,
        email,
        company,
        designation,
        parseInt(years_in_industry),
        profilePicture,
      ]
    );

    const expert = result.rows[0];
    expert.profile_picture = getProfilePictureUrl(expert.id);

    res.status(201).json({
      success: true,
      message: "Expert registered successfully",
      data: { expert },
    });
  } catch (err) {
    if (profilePicture) fs.unlinkSync(profilePicture); // Cleanup newly uploaded file in case of error
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error registering expert",
    });
  }
};

// Update an existing expert
export const updateExpert = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    linkedin,
    email,
    company,
    designation,
    years_in_industry,
  } = req.body;
  const newProfilePicture = req.file ? req.file.path : null;

  try {
    const expertCheck = await pool.query(
      `SELECT * FROM experts WHERE id = $1`,
      [id]
    );
    if (expertCheck.rows.length === 0) {
      if (newProfilePicture) fs.unlinkSync(newProfilePicture); // Cleanup newly uploaded file
      return res.status(404).json({
        success: false,
        message: "Expert not found",
      });
    }

    const oldProfilePicture = expertCheck.rows[0].profile_picture;

    if (newProfilePicture && oldProfilePicture) {
      const oldPicturePath = path.resolve(oldProfilePicture);
      fs.unlink(oldPicturePath, (err) => {
        if (err) console.error("Error deleting old profile picture:", err);
      });
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (name) {
      fields.push(`name = $${index}`);
      values.push(name);
      index++;
    }
    if (phone) {
      fields.push(`phone = $${index}`);
      values.push(phone);
      index++;
    }
    if (linkedin) {
      fields.push(`linkedin = $${index}`);
      values.push(linkedin);
      index++;
    }
    if (email) {
      fields.push(`email = $${index}`);
      values.push(email);
      index++;
    }
    if (company) {
      fields.push(`company = $${index}`);
      values.push(company);
      index++;
    }
    if (designation) {
      fields.push(`designation = $${index}`);
      values.push(designation);
      index++;
    }
    if (years_in_industry) {
      fields.push(`years_in_industry = $${index}`);
      values.push(parseInt(years_in_industry));
      index++;
    }
    if (newProfilePicture) {
      fields.push(`profile_picture = $${index}`);
      values.push(newProfilePicture);
      index++;
    }

    if (fields.length === 0) {
      if (newProfilePicture) fs.unlinkSync(newProfilePicture); // Cleanup newly uploaded file
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    const query = `UPDATE experts SET ${fields.join(
      ", "
    )} WHERE id = $${index} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    const updatedExpert = result.rows[0];
    updatedExpert.profile_picture = getProfilePictureUrl(updatedExpert.id);

    res.status(200).json({
      success: true,
      message: "Expert updated successfully",
      data: { updatedExpert },
    });
  } catch (err) {
    if (newProfilePicture) fs.unlinkSync(newProfilePicture); // Cleanup newly uploaded file in case of error
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating expert",
    });
  }
};

// Delete an expert
export const deleteExpert = async (req, res) => {
  const { id } = req.params;

  try {
    const expertCheck = await pool.query(
      `SELECT * FROM experts WHERE id = $1`,
      [id]
    );
    if (expertCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expert not found",
      });
    }

    const profilePicture = expertCheck.rows[0].profile_picture;

    await pool.query(`DELETE FROM experts WHERE id = $1`, [id]);

    if (profilePicture) {
      const profilePicturePath = path.resolve(profilePicture);
      fs.unlink(profilePicturePath, (err) => {
        if (err) console.error("Error deleting profile picture:", err);
        else console.log("Profile picture deleted successfully");
      });
    }

    res.status(200).json({
      success: true,
      message: "Expert deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error deleting expert",
    });
  }
};

// List all experts
export const listExperts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM experts");
    const experts = result.rows.map((expert) => ({
      ...expert,
      profile_picture: getProfilePictureUrl(expert.id),
    }));

    res.status(200).json({
      success: true,
      message: "Experts retrieved successfully",
      data: { experts },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching experts",
    });
  }
};

// Stream the profile picture of an expert
export const streamProfilePicture = async (req, res) => {
  const { id } = req.params;

  try {
    const expertCheck = await pool.query(
      `SELECT profile_picture FROM experts WHERE id = $1`,
      [id]
    );
    if (expertCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expert not found",
      });
    }

    const profilePicturePath = expertCheck.rows[0].profile_picture;

    if (!profilePicturePath || !fs.existsSync(profilePicturePath)) {
      return res.status(404).json({
        success: false,
        message: "Profile picture not found",
      });
    }

    const stream = fs.createReadStream(profilePicturePath);
    const extension = path.extname(profilePicturePath).substring(1);

    res.setHeader("Content-Type", `image/${extension}`);
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error streaming profile picture",
    });
  }
};

// Get details of an expert by ID
export const getExpertById = async (req, res) => {
  const { id } = req.params;

  try {
    // Retrieve expert details from the database
    const result = await pool.query(`SELECT * FROM experts WHERE id = $1`, [
      id,
    ]);

    // Check if expert exists
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expert not found",
      });
    }

    // Format the expert data to include the profile picture URL
    const expert = result.rows[0];
    expert.profile_picture = getProfilePictureUrl(expert.id);

    res.status(200).json({
      success: true,
      message: "Expert details retrieved successfully",
      data: { expert },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching expert details",
    });
  }
};
