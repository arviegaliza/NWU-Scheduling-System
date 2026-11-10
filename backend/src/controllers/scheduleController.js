
const pool = require("../config/database");

const ALLOWED_STATUSES = [
  "Pending",
  "Approved",
  "Ongoing",
  "Completed",
  "Cancelled",
];

// Accepts 24-hour values (16:00) or 12-hour values (4:00 PM).
function normalizeTime(value) {
  if (typeof value !== "string") {
    return null;
  }

  const time = value.trim();

  const twelveHourMatch = time.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      return null;
    }

    if (period === "AM" && hour === 12) hour = 0;
    if (period === "PM" && hour !== 12) hour += 12;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  const twentyFourHourMatch = time.match(
    /^(\d{2}):(\d{2})$/
  );

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);

    if (hour > 23 || minute > 59) {
      return null;
    }

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  return null;
}

function validateSchedule(body) {
  const {
    researchTitle,
    researcher,
    activity,
    date,
    startTime,
    endTime,
    venue,
    panelChair,
  } = body;

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
    return {
      error: "Please complete all required schedule fields.",
    };
  }

  const normalizedStart = normalizeTime(startTime);
  const normalizedEnd = normalizeTime(endTime);

  if (!normalizedStart || !normalizedEnd) {
    return {
      error: "Invalid time. Use a valid time such as 10:00 AM or 16:00.",
    };
  }

  if (normalizedEnd <= normalizedStart) {
    return {
      error: "End time must be later than start time.",
    };
  }

  return {
    normalizedStart,
    normalizedEnd,
  };
}

const scheduleSelect = `
  SELECT
    id,
    research_title AS "researchTitle",
    researcher,
    activity,
    TO_CHAR(schedule_date, 'YYYY-MM-DD') AS date,
    TO_CHAR(start_time, 'FMHH12:MI AM') AS "startTime",
    TO_CHAR(end_time, 'FMHH12:MI AM') AS "endTime",
    venue,
    panel_chair AS "panelChair",
    status
  FROM schedules
`;

// GET ALL SCHEDULES
exports.getSchedules = async (req, res) => {
  try {
    const result = await pool.query(`
      ${scheduleSelect}
      ORDER BY schedule_date ASC, start_time ASC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get schedules error:", error.message);
    res.status(500).json({
      message: "Failed to retrieve schedules.",
    });
  }
};

// GET SINGLE SCHEDULE
exports.getScheduleById = async (req, res) => {
  try {
    const result = await pool.query(
      `
        ${scheduleSelect}
        WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Schedule not found.",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get schedule error:", error.message);
    res.status(500).json({
      message: "Failed to retrieve schedule.",
    });
  }
};

// CREATE SCHEDULE
exports.createSchedule = async (req, res) => {
  try {
    const validation = validateSchedule(req.body);

    if (validation.error) {
      return res.status(400).json({
        message: validation.error,
      });
    }

    const {
      researchTitle,
      researcher,
      activity,
      date,
      venue,
      panelChair,
      status = "Pending",
    } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid schedule status.",
      });
    }

    const result = await pool.query(
      `
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          id,
          research_title AS "researchTitle",
          researcher,
          activity,
          TO_CHAR(schedule_date, 'YYYY-MM-DD') AS date,
          TO_CHAR(start_time, 'FMHH12:MI AM') AS "startTime",
          TO_CHAR(end_time, 'FMHH12:MI AM') AS "endTime",
          venue,
          panel_chair AS "panelChair",
          status
      `,
      [
        researchTitle,
        researcher,
        activity,
        date,
        validation.normalizedStart,
        validation.normalizedEnd,
        venue,
        panelChair,
        status,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create schedule error:", error.message);
    res.status(500).json({
      message: "Failed to create schedule.",
    });
  }
};

// UPDATE SCHEDULE
exports.updateSchedule = async (req, res) => {
  try {
    const validation = validateSchedule(req.body);

    if (validation.error) {
      return res.status(400).json({
        message: validation.error,
      });
    }

    const {
      researchTitle,
      researcher,
      activity,
      date,
      venue,
      panelChair,
      status,
    } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid schedule status.",
      });
    }

    const result = await pool.query(
      `
        UPDATE schedules
        SET
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
          TO_CHAR(start_time, 'FMHH12:MI AM') AS "startTime",
          TO_CHAR(end_time, 'FMHH12:MI AM') AS "endTime",
          venue,
          panel_chair AS "panelChair",
          status
      `,
      [
        researchTitle,
        researcher,
        activity,
        date,
        validation.normalizedStart,
        validation.normalizedEnd,
        venue,
        panelChair,
        status,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Schedule not found.",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Update schedule error:", error.message);
    res.status(500).json({
      message: "Failed to update schedule.",
    });
  }
};

// DELETE SCHEDULE
exports.deleteSchedule = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM schedules WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Schedule not found.",
      });
    }

    res.status(200).json({
      message: "Schedule deleted successfully.",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete schedule error:", error.message);
    res.status(500).json({
      message: "Failed to delete schedule.",
    });
  }
};
