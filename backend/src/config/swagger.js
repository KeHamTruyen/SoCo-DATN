import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Commerce API',
      version: '1.0.0',
      description: 'API documentation for Social Commerce Platform - Mạng xã hội kết hợp thương mại điện tử',
      contact: {
        name: 'API Support',
        email: 'support@socialcommerce.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.socialcommerce.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token in HTTP-only cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx123abc' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
            fullName: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', nullable: true, example: '0123456789' },
            avatar: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
            coverImage: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['BUYER', 'SELLER', 'ADMIN'], example: 'BUYER' },
            isActive: { type: 'boolean', example: true },
            isVerified: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            _count: {
              type: 'object',
              properties: {
                followers: { type: 'integer', example: 0 },
                following: { type: 'integer', example: 0 },
                products: { type: 'integer', example: 0 },
                posts: { type: 'integer', example: 0 }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  msg: { type: 'string' }
                }
              }
            }
          }
        },
        ValidationErrorDetail: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'field' },
            value: { nullable: true, example: 'INVALID' },
            msg: { type: 'string', example: 'Validation error message' },
            path: { type: 'string', example: 'status' },
            location: { type: 'string', example: 'body' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: { $ref: '#/components/schemas/ValidationErrorDetail' }
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, example: 1 },
            limit: { type: 'integer', minimum: 1, example: 20 },
            total: { type: 'integer', minimum: 0, example: 125 },
            totalPages: { type: 'integer', minimum: 1, example: 7 }
          }
        },
        UserSummary: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string', example: 'johndoe' },
            fullName: { type: 'string', example: 'John Doe' },
            avatarUrl: { type: 'string', nullable: true, format: 'uri' },
            role: { type: 'string', enum: ['BUYER', 'SELLER', 'ADMIN'], nullable: true }
          }
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            reporterId: { type: 'string', format: 'uuid' },
            targetType: { type: 'string', enum: ['POST', 'USER', 'PRODUCT', 'SHOP'] },
            targetId: { type: 'string', format: 'uuid' },
            reason: { type: 'string', enum: ['SPAM', 'FRAUD', 'FAKE_INFO', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'COPYRIGHT', 'OTHER'] },
            description: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'] },
            resolutionNote: { type: 'string', nullable: true },
            resolvedBy: { type: 'string', format: 'uuid', nullable: true },
            resolvedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            reporter: { $ref: '#/components/schemas/UserSummary' },
            resolver: { $ref: '#/components/schemas/UserSummary' }
          }
        },
        ReportCreateRequest: {
          type: 'object',
          required: ['targetType', 'targetId', 'reason'],
          properties: {
            targetType: { type: 'string', enum: ['POST', 'USER', 'PRODUCT', 'SHOP'] },
            targetId: { type: 'string', format: 'uuid' },
            reason: { type: 'string', enum: ['SPAM', 'FRAUD', 'FAKE_INFO', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'COPYRIGHT', 'OTHER'] },
            description: { type: 'string', maxLength: 2000 }
          }
        },
        ReportStatusUpdateRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['IN_REVIEW', 'RESOLVED', 'REJECTED'] },
            resolutionNote: { type: 'string', maxLength: 2000, nullable: true }
          }
        },
        ReportSingleResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Report submitted successfully' },
            data: { $ref: '#/components/schemas/Report' }
          }
        },
        ReportListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Report' }
            },
            pagination: { $ref: '#/components/schemas/PaginationMeta' }
          }
        },
        AdminDashboardResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                totals: {
                  type: 'object',
                  properties: {
                    users: { type: 'integer', example: 120 },
                    sellers: { type: 'integer', example: 30 },
                    products: { type: 'integer', example: 540 },
                    orders: { type: 'integer', example: 620 },
                    posts: { type: 'integer', example: 2100 },
                    paidRevenue: { type: 'number', example: 195000000 },
                    pendingSellerVerifications: { type: 'integer', example: 4 }
                  }
                },
                orderStatusBreakdown: {
                  type: 'object',
                  additionalProperties: { type: 'integer' },
                  example: {
                    PENDING: 30,
                    CONFIRMED: 20,
                    SHIPPING: 15,
                    DELIVERED: 120
                  }
                }
              }
            }
          }
        },
        AdminUsersListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  username: { type: 'string' },
                  fullName: { type: 'string' },
                  role: { type: 'string', enum: ['BUYER', 'SELLER', 'ADMIN'] },
                  isActive: { type: 'boolean' },
                  isVerified: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  lastLogin: { type: 'string', format: 'date-time', nullable: true },
                  _count: {
                    type: 'object',
                    properties: {
                      products: { type: 'integer' },
                      posts: { type: 'integer' },
                      followers: { type: 'integer' },
                      following: { type: 'integer' }
                    }
                  }
                }
              }
            },
            pagination: { $ref: '#/components/schemas/PaginationMeta' }
          }
        },
        AdminStatusUpdateResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User has been banned' },
            data: {
              type: 'object',
              additionalProperties: true
            }
          }
        },
        AdminListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: true
              }
            },
            pagination: { $ref: '#/components/schemas/PaginationMeta' }
          }
        },
        AdminSummaryResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                period: {
                  type: 'object',
                  properties: {
                    startDate: { type: 'string', format: 'date-time', nullable: true },
                    endDate: { type: 'string', format: 'date-time', nullable: true }
                  }
                },
                totals: {
                  type: 'object',
                  properties: {
                    users: { type: 'integer' },
                    products: { type: 'integer' },
                    orders: { type: 'integer' },
                    posts: { type: 'integer' },
                    paidOrders: { type: 'integer' },
                    revenue: {
                      type: 'object',
                      properties: {
                        subtotal: { type: 'number' },
                        shippingFee: { type: 'number' },
                        total: { type: 'number' }
                      }
                    }
                  }
                },
                topSellers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      seller: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          username: { type: 'string', nullable: true },
                          fullName: { type: 'string', nullable: true }
                        }
                      },
                      orders: { type: 'integer' },
                      sales: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        },
        // ── Analytics ───────────────────────────────────────────────────────
        SellerDashboardResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                period: {
                  type: 'object',
                  properties: {
                    startDate: { type: 'string', format: 'date-time', nullable: true },
                    endDate: { type: 'string', format: 'date-time', nullable: true }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 12 },
                        active: { type: 'integer', example: 10 }
                      }
                    },
                    audience: {
                      type: 'object',
                      properties: {
                        totalFollowers: { type: 'integer', example: 340 },
                        newFollowers: { type: 'integer', example: 8 }
                      }
                    },
                    traffic: {
                      type: 'object',
                      properties: {
                        totalViews: { type: 'integer', example: 1500 }
                      }
                    },
                    sales: {
                      type: 'object',
                      properties: {
                        totalOrders: { type: 'integer', example: 25 },
                        totalItemsSold: { type: 'integer', example: 60 },
                        grossRevenue: { type: 'number', example: 4500000 }
                      }
                    }
                  }
                },
                topProducts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      product: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          title: { type: 'string', nullable: true },
                          slug: { type: 'string', nullable: true },
                          imageUrl: { type: 'string', format: 'uri', nullable: true }
                        }
                      },
                      quantitySold: { type: 'integer', example: 15 },
                      revenue: { type: 'number', example: 750000 }
                    }
                  }
                }
              }
            }
          }
        },
        SellerStatsHistoryResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                days: { type: 'integer', example: 30 },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string', format: 'date-time' },
                      totalSales: { type: 'number', example: 5 },
                      totalOrders: { type: 'integer', example: 3 },
                      totalRevenue: { type: 'number', example: 250000 },
                      totalProfit: { type: 'number', example: 50000 },
                      totalProducts: { type: 'integer', example: 10 },
                      totalViews: { type: 'integer', example: 120 },
                      newFollowers: { type: 'integer', example: 2 },
                      totalLikes: { type: 'integer', example: 8 },
                      totalComments: { type: 'integer', example: 3 }
                    }
                  }
                }
              }
            }
          }
        },
        PlatformOverviewResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                period: {
                  type: 'object',
                  properties: {
                    startDate: { type: 'string', format: 'date-time', nullable: true },
                    endDate: { type: 'string', format: 'date-time', nullable: true }
                  }
                },
                totals: {
                  type: 'object',
                  properties: {
                    users: { type: 'integer', example: 1200 },
                    sellers: { type: 'integer', example: 80 },
                    products: { type: 'integer', example: 500 },
                    orders: { type: 'integer', example: 850 },
                    posts: { type: 'integer', example: 2300 },
                    productViews: { type: 'integer', example: 15000 },
                    paidOrders: { type: 'integer', example: 720 },
                    revenue: {
                      type: 'object',
                      properties: {
                        subtotal: { type: 'number', example: 85000000 },
                        shippingFee: { type: 'number', example: 4250000 },
                        total: { type: 'number', example: 89250000 }
                      }
                    }
                  }
                },
                topSellers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      seller: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          username: { type: 'string', nullable: true },
                          fullName: { type: 'string', nullable: true },
                          avatarUrl: { type: 'string', format: 'uri', nullable: true }
                        }
                      },
                      soldItems: { type: 'integer', example: 120 },
                      revenue: { type: 'number', example: 12000000 }
                    }
                  }
                }
              }
            }
          }
        },
        AggregateJobResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Aggregation completed' },
            data: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date', example: '2026-03-15' },
                processedSellers: { type: 'integer', example: 42 }
              }
            }
          }
        },
        // ── Groups ───────────────────────────────────────────────────────────
        GroupItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Hội Handmade Việt Nam' },
            slug: { type: 'string', example: 'hoi-handmade-viet-nam' },
            description: { type: 'string', nullable: true },
            privacy: { type: 'string', enum: ['PUBLIC', 'PRIVATE', 'SECRET'] },
            coverImageUrl: { type: 'string', format: 'uri', nullable: true },
            avatarUrl: { type: 'string', format: 'uri', nullable: true },
            membersCount: { type: 'integer', example: 234 },
            createdAt: { type: 'string', format: 'date-time' },
            creator: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                username: { type: 'string' },
                fullName: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', format: 'uri', nullable: true }
              }
            },
            isMember: { type: 'boolean', example: false },
            memberRole: { type: 'string', enum: ['ADMIN', 'MEMBER'], nullable: true }
          }
        },
        GroupMemberItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['ADMIN', 'MEMBER'] },
            joinedAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                username: { type: 'string' },
                fullName: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', format: 'uri', nullable: true }
              }
            }
          }
        },
        GroupListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                groups: { type: 'array', items: { $ref: '#/components/schemas/GroupItem' } },
                pagination: { $ref: '#/components/schemas/PaginationMeta' }
              }
            }
          }
        },
        GroupDetailResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              allOf: [
                { $ref: '#/components/schemas/GroupItem' },
                {
                  type: 'object',
                  properties: {
                    myMembership: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        role: { type: 'string', enum: ['ADMIN', 'MEMBER'] },
                        joinedAt: { type: 'string', format: 'date-time' }
                      }
                    },
                    members: { type: 'array', items: { $ref: '#/components/schemas/GroupMemberItem' } },
                    _count: {
                      type: 'object',
                      properties: {
                        members: { type: 'integer', example: 234 }
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        GroupMembersListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                members: { type: 'array', items: { $ref: '#/components/schemas/GroupMemberItem' } },
                pagination: { $ref: '#/components/schemas/PaginationMeta' }
              }
            }
          }
        },
        GroupActionResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Joined group successfully' },
            data: { type: 'object', nullable: true }
          }
        },
        // ── Scheduled Posts ──────────────────────────────────────────────────
        ScheduledPostItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            content: { type: 'string', example: 'Check out my new product!' },
            mediaUrls: { type: 'array', items: { type: 'string', format: 'uri' } },
            mediaType: { type: 'string', enum: ['IMAGE', 'VIDEO', 'NONE'] },
            productId: { type: 'string', format: 'uuid', nullable: true },
            scheduledTime: { type: 'string', format: 'date-time' },
            timezone: { type: 'string', example: 'Asia/Ho_Chi_Minh' },
            status: { type: 'string', enum: ['scheduled', 'published', 'failed'] },
            publishedPostId: { type: 'string', format: 'uuid', nullable: true },
            errorMessage: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            product: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                images: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      imageUrl: { type: 'string', format: 'uri' }
                    }
                  }
                }
              }
            }
          }
        },
        ScheduledPostSingleResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/ScheduledPostItem' }
          }
        },
        ScheduledPostListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                scheduledPosts: { type: 'array', items: { $ref: '#/components/schemas/ScheduledPostItem' } },
                pagination: { $ref: '#/components/schemas/PaginationMeta' }
              }
            }
          }
        },
        // ── Search ───────────────────────────────────────────────────────────
        SearchProductItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            slug: { type: 'string' },
            price: { type: 'number', example: 150000 },
            status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'] },
            viewsCount: { type: 'integer', example: 230 },
            salesCount: { type: 'integer', example: 45 },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  imageUrl: { type: 'string', format: 'uri' },
                  altText: { type: 'string', nullable: true }
                }
              }
            },
            seller: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                username: { type: 'string' },
                fullName: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', format: 'uri', nullable: true },
                isVerified: { type: 'boolean' }
              }
            },
            category: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                slug: { type: 'string' }
              }
            }
          }
        },
        SearchUserItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            fullName: { type: 'string', nullable: true },
            avatarUrl: { type: 'string', format: 'uri', nullable: true },
            bio: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['BUYER', 'SELLER', 'ADMIN'] },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            _count: {
              type: 'object',
              properties: {
                followers: { type: 'integer' },
                products: { type: 'integer' },
                posts: { type: 'integer' }
              }
            }
          }
        },
        SearchPostItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            content: { type: 'string' },
            mediaUrls: { type: 'array', items: { type: 'string', format: 'uri' } },
            mediaType: { type: 'string', enum: ['IMAGE', 'VIDEO', 'NONE'] },
            createdAt: { type: 'string', format: 'date-time' },
            author: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                username: { type: 'string' },
                fullName: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', format: 'uri', nullable: true }
              }
            }
          }
        },
        SearchAllResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                products: { type: 'array', items: { $ref: '#/components/schemas/SearchProductItem' } },
                users: { type: 'array', items: { $ref: '#/components/schemas/SearchUserItem' } },
                posts: { type: 'array', items: { $ref: '#/components/schemas/SearchPostItem' } }
              }
            }
          }
        },
        SearchProductsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/SearchProductItem' } },
                pagination: { $ref: '#/components/schemas/PaginationMeta' }
              }
            }
          }
        },
        SearchUsersResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/SearchUserItem' } },
                pagination: { $ref: '#/components/schemas/PaginationMeta' }
              }
            }
          }
        },
        SearchPostsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/SearchPostItem' } },
                pagination: { $ref: '#/components/schemas/PaginationMeta' }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints (Đăng nhập, đăng ký, xác thực)'
      },
      {
        name: 'Users',
        description: 'User management endpoints (Quản lý người dùng)'
      },
      {
        name: 'Products',
        description: 'Product management endpoints (Quản lý sản phẩm)'
      },
      {
        name: 'Orders',
        description: 'Order management endpoints (Quản lý đơn hàng)'
      },
      {
        name: 'Posts',
        description: 'Social posts endpoints (Quản lý bài viết)'
      },
      {
        name: 'Messages',
        description: 'Messaging endpoints (Quản lý tin nhắn)'
      },
      {
        name: 'Reports',
        description: 'Content and account report endpoints (Báo cáo vi phạm)'
      },
      {
        name: 'Admin',
        description: 'Admin moderation and management endpoints'
      },
      {
        name: 'Analytics',
        description: 'Seller and platform analytics endpoints'
      },
      {
        name: 'Groups',
        description: 'Group and membership endpoints'
      },
      {
        name: 'ScheduledPosts',
        description: 'Scheduled post management endpoints'
      },
      {
        name: 'Search',
        description: 'Search endpoints for products, users, posts'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'] // Path to API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
