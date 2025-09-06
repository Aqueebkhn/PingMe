import express from "express";
import protectRoutes from "../middleware/auth.middleware.js"; 
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoutes, getUsersForSidebar);
router.get("/:id", protectRoutes, getMessages);
router.post("/send/:id", protectRoutes, sendMessage);

export default router;
