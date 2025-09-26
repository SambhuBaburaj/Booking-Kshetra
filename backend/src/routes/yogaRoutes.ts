import express from "express";
import {
  getAllYogaSessions,
  getYogaSessionById,
  createYogaSession,
  updateYogaSession,
  deleteYogaSession,
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getYogaAnalytics,
  getAllDailyYogaSessions,
  getDailyYogaSessionById,
  createDailyYogaSession,
  updateDailyYogaSession,
  deleteDailyYogaSession,
} from "../controllers/yogaController";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/sessions", getAllYogaSessions);
router.get("/sessions/:id", getYogaSessionById);
router.get("/teachers", getAllTeachers);
router.get("/teachers/:id", getTeacherById);
router.get("/daily-sessions", getAllDailyYogaSessions);
router.get("/daily-sessions/:id", getDailyYogaSessionById);

// Admin only routes
router.post("/sessions", authenticate, authorize("admin"), createYogaSession);
router.put(
  "/sessions/:id",
  authenticate,
  authorize("admin"),
  updateYogaSession
);
router.delete(
  "/sessions/:id",
  authenticate,
  authorize("admin"),
  deleteYogaSession
);

router.post("/teachers", authenticate, authorize("admin"), createTeacher);
router.put("/teachers/:id", authenticate, authorize("admin"), updateTeacher);
router.delete("/teachers/:id", authenticate, authorize("admin"), deleteTeacher);

router.get("/analytics", authenticate, authorize("admin"), getYogaAnalytics);

// Daily sessions admin routes
router.post("/daily-sessions", authenticate, authorize("admin"), createDailyYogaSession);
router.put("/daily-sessions/:id", authenticate, authorize("admin"), updateDailyYogaSession);
router.delete("/daily-sessions/:id", authenticate, authorize("admin"), deleteDailyYogaSession);

export default router;
