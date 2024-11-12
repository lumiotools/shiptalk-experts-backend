import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import {
  registerExpert,
  listExperts,
  getExpertById,
  updateExpert,
  deleteExpert,
  streamProfilePicture,
} from "../controllers/expert.js";

const router = express.Router();

// POST /api/experts - Register a new expert
router.post("/experts", upload.single("profile_picture"), registerExpert);

// GET /api/experts - List all experts
router.get("/experts", listExperts);

// GET /api/experts/:id - Get expert details by ID
router.get('/experts/:id', getExpertById);

// PUT /api/experts/:id - Update an expert
router.put("/experts/:id", upload.single("profile_picture"), updateExpert);

// DELETE /api/experts/:id - Delete an expert
router.delete("/experts/:id", deleteExpert);

// GET /api/experts/:id/profile-picture - Stream profile picture of an expert
router.get("/experts/:id/profile-picture", streamProfilePicture);

export default router;
