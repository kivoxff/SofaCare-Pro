import express = require("express");
import { type Router } from "express";
import authController = require("../controllers/auth.controller");
import multerUpload = require("../config/multer");

const router: Router = express.Router();

// POST /api/auth/register
router.post("/register", multerUpload.single("profilePicture"), authController.register)

// POST /api/auth/login
router.post("/login", authController.login)

// POST /api/auth/logout
router.post("/logout", authController.logout);

export = router;