
const pool = require("../config/database");

let isRunning = false;

async function updateScheduleStatuses(io) {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    const result = await pool.query(`
      UPDATE schedules
      SET
        status = CASE
          WHEN (schedule_date + end_time) <=
            (NOW() AT TIME ZONE 'Asia/Manila')
          THEN 'Completed'
          ELSE 'Ongoing'
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE
        status IN ('Pending', 'Approved', 'Ongoing')
        AND (schedule_date + start_time) <=
          (NOW() AT TIME ZONE 'Asia/Manila')
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
    `);

    if (result.rowCount > 0) {
      console.log(
        `[Schedule Scheduler] Updated ${result.rowCount} schedule(s).`
      );

      // Notify every connected frontend page.
      if (io) {
        io.emit("schedules:updated", {
          action: "statuses_updated",
          schedules: result.rows,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error(
      "[Schedule Scheduler] Failed to update statuses:",
      error.message
    );
  } finally {
    isRunning = false;
  }
}

function startScheduleStatusScheduler(io) {
  console.log(
    "[Schedule Scheduler] Started using Asia/Manila timezone."
  );

  // Run immediately when backend starts.
  updateScheduleStatuses(io);

  // Check schedules every minute.
  setInterval(() => {
    updateScheduleStatuses(io);
  }, 60 * 1000);
}

module.exports = {
  updateScheduleStatuses,
  startScheduleStatusScheduler,
};
