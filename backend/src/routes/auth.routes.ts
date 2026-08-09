import express = require("express");
import { type Router } from "express";
import authController = require("../controllers/auth.controller");
import multerUpload = require("../config/multer");
import authMiddleware = require("../middleware/auth.middleware");

const router: Router = express.Router();

// POST /api/auth/register
router.post("/register", multerUpload.single("profileImage"), authController.register)

// POST /api/auth/login
router.post("/login", authController.login)

// POST /api/auth/logout
router.post("/logout", authController.logout);

// GET /api/auth/me
router.get("/me", authMiddleware.requireAuth ,authController.getMe);

export = router;