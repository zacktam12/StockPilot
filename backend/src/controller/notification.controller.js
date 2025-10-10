const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const total = await prisma.notification.count({
      where: {
        userId: userId,
      },
    });

    res.json({
      data: notifications,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.update({
      where: {
        id: id,
        userId: userId, // Ensure user can only mark their own notifications as read
      },
      data: {
        read: true,
      },
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Create a notification (internal use)
const createNotification = async (
  userId,
  type,
  title,
  message,
  data = null
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
      },
    });
    return notification;
  } catch (error) {
    return null;
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId: userId,
        read: false,
      },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.notification.delete({
      where: {
        id: id,
        userId: userId, // Ensure user can only delete their own notifications
      },
    });

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getUnreadCount,
  deleteNotification,
};
