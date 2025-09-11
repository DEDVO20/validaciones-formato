import { Notification } from "../models/notification.model";

export const createNotification = async (
  userId: number,
  message: string
) => {
  return await Notification.create({ userId, message });
};

export const markAsRead = async (id: number): Promise<void> => {
  await Notification.update({ read: true }, { where: { id } });
};

export const getUserNotifications = async (userId: number) => {
  return await Notification.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });
};
