const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} = require("../controller/notification.controller");

// Get all notifications for the authenticated user
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark a specific notification as read
router.post("/mark-read/:id", markAsRead);

// Mark all notifications as read
router.post("/mark-all-read", markAllAsRead);

// Delete a notification
router.delete("/:id", deleteNotification);

module.exports = router;
