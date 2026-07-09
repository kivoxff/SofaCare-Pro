import express = require("express");
import { type Router } from "express";
import authMiddleware = require("../middleware/auth.middleware");
import userController = require("../controllers/user.controller");

const router: Router = express.Router();

// PATCH /api/users/:id/role
router.patch("/:id/role", authMiddleware.requireAuth, authMiddleware.requireRole(["Manager", "Owner"]), userController.updateRole);

// GET /api/users/role/:role
router.get("/role/:role", authMiddleware.requireAuth, authMiddleware.requireRole(["Manager", "Owner"]), userController.getUsersByRole);

export = router;