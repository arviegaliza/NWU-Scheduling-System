
const pool = require("../config/database");

let isRunning = false;

async function updateScheduleStatuses() {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    const result = await pool.query(`
      UPDATE schedules
      SET
        status = CASE
          WHEN (
            schedule_date + end_time
          ) <= (
            NOW() AT TIME ZONE 'Asia/Manila'
          )
          THEN 'Completed'
          ELSE 'Ongoing'
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE
        status IN ('Pending', 'Approved', 'Ongoing')
        AND (
          schedule_date + start_time
        ) <= (
          NOW() AT TIME ZONE 'Asia/Manila'
        )
    `);

    if (result.rowCount > 0) {
      console.log(
        `[Schedule Scheduler] Updated ${result.rowCount} schedule(s).`
      );
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

function startScheduleStatusScheduler() {
  console.log(
    "[Schedule Scheduler] Started using Asia/Manila timezone."
  );

  // Run immediately when the backend starts.
  updateScheduleStatuses();

  // Check schedules every minute.
  setInterval(() => {
    updateScheduleStatuses();
  }, 60 * 1000);
}

module.exports = {
  updateScheduleStatuses,
  startScheduleStatusScheduler,
};
