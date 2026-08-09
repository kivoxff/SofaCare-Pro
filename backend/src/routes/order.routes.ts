import express = require("express");
import orderController = require("../controllers/order.controller");
import authMiddleware = require("../middleware/auth.middleware");
import multerUpload = require("../config/multer");

const router = express.Router();
// POST /api/orders/
router.post("/", authMiddleware.requireAuth, orderController.createOrder);

// GET /api/orders/customer
router.get("/customer", authMiddleware.requireAuth, orderController.getCustomerOrders);

// GET /api/orders/internal
router.get("/internal", authMiddleware.requireAuth, authMiddleware.requireRole(["Field_Cleaner", "Manager", "Owner"]), orderController.getInternalOrders);

// GET /api/orders/dashboardStats // Must be registered before // GET /api/orders/:id; otherwise express may treat 'dashboardStats' as the value for 'id' parameter. 
router.get("/dashboardStats", authMiddleware.requireAuth, authMiddleware.requireRole(["Owner"]), orderController.getDashboardStats);

// GET /api/orders/:id
router.get("/:id", authMiddleware.requireAuth, orderController.getOrderById);

// PATCH /api/orders/:id/transition
router.patch("/:id/transition", authMiddleware.requireAuth, authMiddleware.requireRole(["Field_Cleaner", "Manager", "Owner"]), orderController.transitionOrder)

// PATCH /api/orders/:id/completion
router.patch("/:id/completion", authMiddleware.requireAuth, authMiddleware.requireRole(["Field_Cleaner"]), multerUpload.any(), orderController.submitCompletion) // multerUpload.any(): Accepts dynamic image keys like 'before_SOFA-1'

export = router;



// FUTURE PLAN

// Can also be implemented to use only one route
// ?viewAs=customer or ?viewAs=cleaner

// Cleaner's Work Queue:
// GET /orders?assignedTo=me

// Manager's "Managed By Me" Tab:
// GET /orders?assignedBy=me

// Manager's "Open Pool" Tab:
// GET /orders?status=pending

// Pagination Later (Seamless combination):
// GET /orders?assignedBy=me&page=1&limit=10
