const express = require("express");
const router = express.Router();

const {
  getResearchActivities,
  createResearchActivity,
  updateResearchActivity,
  deleteResearchActivity,
} = require("../controllers/researchActivityController");

router.get("/", getResearchActivities);
router.post("/", createResearchActivity);
router.put("/:id", updateResearchActivity);
router.delete("/:id", deleteResearchActivity);

module.exports = router;