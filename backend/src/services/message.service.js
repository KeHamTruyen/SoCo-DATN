import prisma from '../config/database.js';
import { getIO, isUserOnline } from '../config/socket.js';
import notificationService from './notification.service.js';

const PARTICIPANT_USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatarUrl: true,
  isVerified: true,
};

class MessageService {
  async getOrCreateDirectConversation(userId, otherUserId) {
    if (userId === otherUserId) throw new Error('Cannot message yourself');

    const other = await prisma.user.findUnique({ where: { id: otherUserId } });
    if (!other) throw new Error('User not found');

    const existing = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        participants: { include: { user: { select: PARTICIPANT_USER_SELECT } } },
      },
    });

    if (existing) return existing;

    return prisma.conversation.create({
      data: {
        type: 'DIRECT',
        createdBy: userId,
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: {
        participants: { include: { user: { select: PARTICIPANT_USER_SELECT } } },
      },
    });
  }

  async sendMessage(conversationId, senderId, data) {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: senderId } },
    });
    if (!participant) throw new Error('Not a participant');

    const { content, messageType, mediaUrl, productId, orderId } = data;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        messageType: messageType || 'TEXT',
        mediaUrl,
        productId,
        orderId,
      },
      include: {
        sender: { select: PARTICIPANT_USER_SELECT },
        product: productId
          ? {
              select: {
                id: true,
                title: true,
                price: true,
                images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
              },
            }
          : false,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    try {
      getIO().to(`conversation:${conversationId}`).emit('message:new', message);
    } catch { /* socket not critical */ }

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, username: true, fullName: true },
    });
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: senderId } },
      select: { userId: true },
    });
    for (const p of otherParticipants) {
      if (!isUserOnline(p.userId)) {
        notificationService.notifyNewMessage(conversationId, sender, p.userId).catch(() => {});
      }
    }

    return message;
  }

  async getConversations(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const participantRows = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    const conversationIds = participantRows.map((r) => r.conversationId);

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { id: { in: conversationIds } },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          participants: {
            include: { user: { select: PARTICIPANT_USER_SELECT } },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { sender: { select: { id: true, fullName: true } } },
          },
        },
      }),
      prisma.conversation.count({ where: { id: { in: conversationIds } } }),
    ]);

    const unreadRows = conversationIds.length
      ? await prisma.message.groupBy({
          by: ['conversationId'],
          where: {
            conversationId: { in: conversationIds },
            senderId: { not: userId },
            isRead: false,
            isDeleted: false,
          },
          _count: { _all: true },
        })
      : [];
    const unreadMap = new Map(unreadRows.map((row) => [row.conversationId, row._count._all]));

    const result = conversations.map((conv) => ({
      ...conv,
      lastMessage: conv.messages[0] || null,
      unreadCount: unreadMap.get(conv.id) || 0,
    }));

    return {
      conversations: result.map(({ messages, ...rest }) => rest),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMessages(conversationId, userId, { page = 1, limit = 50 } = {}) {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new Error('Not a participant');

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: PARTICIPANT_USER_SELECT },
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
            },
          },
        },
      }),
      prisma.message.count({ where: { conversationId, isDeleted: false } }),
    ]);

    return {
      messages: messages.reverse(),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markConversationRead(conversationId, userId) {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new Error('Not a participant');

    await prisma.$transaction([
      prisma.message.updateMany({
        where: { conversationId, senderId: { not: userId }, isRead: false },
        data: { isRead: true },
      }),
      prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() },
      }),
    ]);

    return { success: true };
  }

  async deleteMessage(messageId, userId) {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new Error('Message not found');
    if (message.senderId !== userId) throw new Error('Unauthorized');

    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true, content: null, mediaUrl: null },
    });

    try {
      getIO().to(`conversation:${message.conversationId}`).emit('message:deleted', { messageId });
    } catch { /* socket not critical */ }

    return { success: true };
  }
}

export default new MessageService();
