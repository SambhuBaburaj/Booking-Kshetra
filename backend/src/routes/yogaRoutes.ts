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
} from "../controllers/yogaController";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/sessions", getAllYogaSessions);
router.get("/sessions/:id", getYogaSessionById);
router.get("/teachers", getAllTeachers);
router.get("/teachers/:id", getTeacherById);

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

export default router;
