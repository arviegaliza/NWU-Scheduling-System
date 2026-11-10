
const pool = require("../config/database");

// GET ALL RESEARCH ACTIVITIES
const getResearchActivities = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        research_title AS "researchTitle",
        researcher,
        department,
        category,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM research_activities
      ORDER BY created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get research activities error:", error);

    res.status(500).json({
      message: "Failed to retrieve research activities.",
    });
  }
};

// CREATE RESEARCH ACTIVITY
const createResearchActivity = async (req, res) => {
  try {
    const {
      researchTitle,
      researcher,
      department,
      category,
      status,
    } = req.body;

    if (
      !researchTitle ||
      !researcher ||
      !department ||
      !category ||
      !status
    ) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO research_activities (
        research_title,
        researcher,
        department,
        category,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        research_title AS "researchTitle",
        researcher,
        department,
        category,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        researchTitle.trim(),
        researcher.trim(),
        department.trim(),
        category,
        status,
      ]
    );

    res.status(201).json({
      message: "Research activity created successfully.",
      researchActivity: result.rows[0],
    });
  } catch (error) {
    console.error("Create research activity error:", error);

    res.status(500).json({
      message: "Failed to create research activity.",
    });
  }
};

// UPDATE RESEARCH ACTIVITY
const updateResearchActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      researchTitle,
      researcher,
      department,
      category,
      status,
    } = req.body;

    if (
      !researchTitle ||
      !researcher ||
      !department ||
      !category ||
      !status
    ) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    const result = await pool.query(
      `
      UPDATE research_activities
      SET
        research_title = $1,
        researcher = $2,
        department = $3,
        category = $4,
        status = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING
        id,
        research_title AS "researchTitle",
        researcher,
        department,
        category,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        researchTitle.trim(),
        researcher.trim(),
        department.trim(),
        category,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Research activity not found.",
      });
    }

    res.status(200).json({
      message: "Research activity updated successfully.",
      researchActivity: result.rows[0],
    });
  } catch (error) {
    console.error("Update research activity error:", error);

    res.status(500).json({
      message: "Failed to update research activity.",
    });
  }
};

// DELETE RESEARCH ACTIVITY
const deleteResearchActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM research_activities
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Research activity not found.",
      });
    }

    res.status(200).json({
      message: "Research activity deleted successfully.",
    });
  } catch (error) {
    console.error("Delete research activity error:", error);

    res.status(500).json({
      message: "Failed to delete research activity.",
    });
  }
};

module.exports = {
  getResearchActivities,
  createResearchActivity,
  updateResearchActivity,
  deleteResearchActivity,
};
