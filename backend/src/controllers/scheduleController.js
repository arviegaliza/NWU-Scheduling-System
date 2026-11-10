
const pool = require("../config/database");

// GET ALL SCHEDULES
exports.getSchedules = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        research_title AS "researchTitle",
        researcher,
        activity,
        TO_CHAR(schedule_date, 'YYYY-MM-DD') AS date,
        TO_CHAR(start_time, 'HH24:MI') AS "startTime",
        TO_CHAR(end_time, 'HH24:MI') AS "endTime",
        venue,
        panel_chair AS "panelChair",
        status
      FROM schedules
      ORDER BY schedule_date ASC, start_time ASC
    `);

    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Get schedules error:", error);
    res.status(500).json({
      message: "Failed to retrieve schedules."
    });
  }
};

// GET SINGLE SCHEDULE
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        id,
        research_title AS "researchTitle",
        researcher,
        activity,
        TO_CHAR(schedule_date, 'YYYY-MM-DD') AS date,
        TO_CHAR(start_time, 'HH24:MI') AS "startTime",
        TO_CHAR(end_time, 'HH24:MI') AS "endTime",
        venue,
        panel_chair AS "panelChair",
        status
      FROM schedules
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Schedule not found."
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({
      message: "Failed to retrieve schedule."
    });
  }
};

// CREATE SCHEDULE
exports.createSchedule = async (req, res) => {
  try {
    const {
      researchTitle,
      researcher,
      activity,
      date,
      startTime,
      endTime,
      venue,
      panelChair,
      status
    } = req.body;

    if (
      !researchTitle ||
      !researcher ||
      !activity ||
      !date ||
      !startTime ||
      !endTime ||
      !venue ||
      !panelChair
    ) {
      return res.status(400).json({
        message: "Please complete all required fields."
      });
    }

    if (endTime <= startTime) {
      return res.status(400).json({
        message: "End time must be later than start time."
      });
    }

    const result = await pool.query(`
      INSERT INTO schedules (
        research_title,
        researcher,
        activity,
        schedule_date,
        start_time,
        end_time,
        venue,
        panel_chair,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING
        id,
        research_title AS "researchTitle",
        researcher,
        activity,
        TO_CHAR(schedule_date, 'YYYY-MM-DD') AS date,
        TO_CHAR(start_time, 'HH24:MI') AS "startTime",
        TO_CHAR(end_time, 'HH24:MI') AS "endTime",
        venue,
        panel_chair AS "panelChair",
        status
    `, [
      researchTitle,
      researcher,
      activity,
      date,
      startTime,
      endTime,
      venue,
      panelChair,
      status || "Pending"
    ]);

    res.status(201).json({
      message: "Schedule created successfully.",
      schedule: result.rows[0]
    });

  } catch (error) {
    console.error("Create schedule error:", error);

    res.status(500).json({
      message: "Failed to create schedule."
    });
  }
};

// UPDATE SCHEDULE
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      researchTitle,
      researcher,
      activity,
      date,
      startTime,
      endTime,
      venue,
      panelChair,
      status
    } = req.body;

    if (
      !researchTitle ||
      !researcher ||
      !activity ||
      !date ||
      !startTime ||
      !endTime ||
      !venue ||
      !panelChair
    ) {
      return res.status(400).json({
        message: "Please complete all required fields."
      });
    }

    if (endTime <= startTime) {
      return res.status(400).json({
        message: "End time must be later than start time."
      });
    }

    const result = await pool.query(`
      UPDATE schedules SET
        research_title = $1,
        researcher = $2,
        activity = $3,
        schedule_date = $4,
        start_time = $5,
        end_time = $6,
        venue = $7,
        panel_chair = $8,
        status = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING
        id,
        research_title AS "researchTitle",
        researcher,
        activity,
        TO_CHAR(schedule_date, 'YYYY-MM-DD') AS date,
        TO_CHAR(start_time, 'HH24:MI') AS "startTime",
        TO_CHAR(end_time, 'HH24:MI') AS "endTime",
        venue,
        panel_chair AS "panelChair",
        status
    `, [
      researchTitle,
      researcher,
      activity,
      date,
      startTime,
      endTime,
      venue,
      panelChair,
      status,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Schedule not found."
      });
    }

    res.status(200).json({
      message: "Schedule updated successfully.",
      schedule: result.rows[0]
    });

  } catch (error) {
    console.error("Update schedule error:", error);

    res.status(500).json({
      message: "Failed to update schedule."
    });
  }
};

// DELETE SCHEDULE
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM schedules WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Schedule not found."
      });
    }

    res.status(200).json({
      message: "Schedule deleted successfully."
    });

  } catch (error) {
    console.error("Delete schedule error:", error);

    res.status(500).json({
      message: "Failed to delete schedule."
    });
  }
};
