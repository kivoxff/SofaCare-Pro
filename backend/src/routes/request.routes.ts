import express = require("express");
import requestController = require("../controllers/request.controller");
import authMiddleware = require("../middleware/auth.middleware");
import multerUpload = require("../config/multer");

const router = express.Router();
// POST /api/requests/
router.post("/", authMiddleware.requireAuth, requestController.createRequest);

// GET /api/requests/customer
router.get("/customer", authMiddleware.requireAuth, requestController.getCustomerRequests);

// GET /api/requests/internal
router.get("/internal", authMiddleware.requireAuth, authMiddleware.requireRole(["Field_Cleaner", "Manager", "Owner"]), requestController.getInternalRequests);

// GET /api/requests/dashboardStats // Must be registered before // GET /api/requests/:id; otherwise express may treat 'dashboardStats' as the value for 'id' parameter. 
router.get("/dashboardStats", authMiddleware.requireAuth, authMiddleware.requireRole(["Manager", "Owner"]), requestController.getDashboardStats);

// GET /api/requests/:id
router.get("/:id", authMiddleware.requireAuth, requestController.getRequestById);

// PATCH /api/requests/:id/transition
router.patch("/:id/transition", authMiddleware.requireAuth, authMiddleware.requireRole(["Field_Cleaner", "Manager", "Owner"]), requestController.transitionRequest)

// PATCH /api/requests/:id/completion
router.patch("/:id/completion", authMiddleware.requireAuth, authMiddleware.requireRole(["Field_Cleaner"]), multerUpload.any(), requestController.submitCompletion) // multerUpload.any(): Accepts dynamic image keys like 'before_SOFA-1'

export = router;



// FUTURE PLAN

// Can also be implemented to use only one route
// ?viewAs=customer or ?viewAs=cleaner

// Cleaner's Work Queue:
// GET /requests?assignedTo=me

// Manager's "Managed By Me" Tab:
// GET /requests?assignedBy=me

// Manager's "Open Pool" Tab:
// GET /requests?status=pending

// Pagination Later (Seamless combination):
// GET /requests?assignedBy=me&page=1&limit=10
