
const pool = require("../config/database");

const getAdminProfile = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        full_name AS "fullName",
        email,
        role,
        profile_picture AS "profilePicture",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM admin_profiles
      ORDER BY id ASC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Administrator profile not found.",
      });
    }

    return res.status(200).json({
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Get admin profile error:", error);

    return res.status(500).json({
      message: "Failed to retrieve administrator profile.",
    });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      !fullName.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Full name and email are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const profilePicture = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const result = await pool.query(
      `
      UPDATE admin_profiles
      SET
        full_name = $1,
        email = $2,
        profile_picture = COALESCE($3, profile_picture),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (
        SELECT id
        FROM admin_profiles
        ORDER BY id ASC
        LIMIT 1
      )
      RETURNING
        id,
        full_name AS "fullName",
        email,
        role,
        profile_picture AS "profilePicture",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [fullName.trim(), normalizedEmail, profilePicture]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Administrator profile not found.",
      });
    }

    return res.status(200).json({
      message: "Administrator profile updated successfully.",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Update admin profile error:", error);

    return res.status(500).json({
      message: "Failed to update administrator profile.",
    });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
};
