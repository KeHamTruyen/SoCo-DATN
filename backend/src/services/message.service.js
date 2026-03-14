import prisma from '../config/database.js';

class MessageService {
  /**
   * Create a new conversation or get existing one between two users
   * @param {string} user1Id - First user ID (current user)
   * @param {string} user2Id - Second user ID (other user)
   * @returns {Promise<Object>} Conversation object
   */
  async getOrCreateConversation(user1Id, user2Id) {
    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [user1Id, user2Id]
            }
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            isRead: true
          }
        }
      }
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        createdBy: user1Id,
        participants: {
          create: [
            { userId: user1Id },
            { userId: user2Id }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        }
      }
    });

    return conversation;
  }

  /**
   * Get all conversations for a user
   * @param {string} userId - User ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<Object>} Conversations list with pagination
   */
  async getUserConversations(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  avatarUrl: true,
                  isVerified: true
                }
              }
            }
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            },
            select: {
              id: true,
              content: true,
              senderId: true,
              createdAt: true,
              isRead: true
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.conversation.count({
        where: {
          participants: {
            some: {
              userId: userId
            }
          }
        }
      })
    ]);

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            isRead: false
          }
        });

        return {
          ...conversation,
          unreadCount
        };
      })
    );

    return {
      conversations: conversationsWithUnread,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get messages in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID (for permission check)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Messages list with pagination
   */
  async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
    // Check if user is participant
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (!isParticipant) {
      throw new Error('You are not a participant of this conversation');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          conversationId
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.message.count({
        where: {
          conversationId
        }
      })
    ]);

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Send a message in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} senderId - Sender user ID
   * @param {string} content - Message content
    * @param {string|null} mediaUrl - Optional media URL
   * @returns {Promise<Object>} Created message
   */
    async sendMessage(conversationId, senderId, content, mediaUrl = null) {
    // Check if user is participant
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: senderId
      }
    });

    if (!isParticipant) {
      throw new Error('You are not a participant of this conversation');
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        messageType: mediaUrl ? 'IMAGE' : 'TEXT',
        mediaUrl,
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true
          }
        }
      }
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  /**
   * Mark messages as read
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID
   * @returns {Promise<number>} Count of updated messages
   */
  async markMessagesAsRead(conversationId, userId) {
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return result.count;
  }

  /**
   * Delete a message (soft delete - mark as deleted)
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID (must be sender)
   * @returns {Promise<Object>} Updated message
   */
  async deleteMessage(messageId, userId) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('You can only delete your own messages');
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: 'This message has been deleted',
        mediaUrl: null,
        isDeleted: true
      }
    });

    return updatedMessage;
  }

  /**
   * Get unread message count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    // Get all conversations user is part of
    const conversations = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true }
    });

    const conversationIds = conversations.map(c => c.conversationId);

    const count = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        isRead: false
      }
    });

    return count;
  }

  /**
   * Search conversations by username
   * @param {string} userId - Current user ID
   * @param {string} searchQuery - Search query
   * @returns {Promise<Array>} Matching conversations
   */
  async searchConversations(userId, searchQuery) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          where: {
            userId: { not: userId }
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // Filter by username or fullName
    const filtered = conversations.filter(conv => {
      const otherUser = conv.participants[0]?.user;
      if (!otherUser) return false;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        otherUser.username.toLowerCase().includes(searchLower) ||
        otherUser.fullName.toLowerCase().includes(searchLower)
      );
    });

    return filtered;
  }
}

export default new MessageService();
