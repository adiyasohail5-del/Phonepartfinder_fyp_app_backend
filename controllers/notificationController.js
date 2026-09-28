const NotificationModel = require('../models/NotificationModel');

async function getMyNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const notifications = await NotificationModel.getByUser(userId);

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user.id;
    const count = await NotificationModel.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (notification.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this notification.'
      });
    }

    await NotificationModel.markAsRead(notificationId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    await NotificationModel.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};