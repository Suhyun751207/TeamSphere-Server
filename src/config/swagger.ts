import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TeamSphere API',
      version: '1.0.0',
      description: 'TeamSphere 팀 협업 플랫폼 API 문서'
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            profileImage: { type: 'string' },
            bio: { type: 'string' },
            phoneNumber: { type: 'string' }
          }
        },
        Room: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            type: { type: 'string', enum: ['DM', 'WORKSPACE'], example: 'WORKSPACE' },
            roomId: { type: 'integer', example: 123 },
            title: { type: 'string', example: '워크스페이스 룸' },
            lastMessageId: { type: 'integer', nullable: true, example: 456 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Workspace: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            ownerId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Team: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            workspaceId: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            workspaceTeamUserId: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            dueDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MongoTask: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            workspaceTeamUserId: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            dueDate: { type: 'string', format: 'date-time' },
            assignees: { type: 'array', items: { type: 'integer' } },
            tags: { type: 'array', items: { type: 'string' } },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: { type: 'string' },
                  url: { type: 'string' },
                  size: { type: 'integer' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            roomId: { type: 'string' },
            senderId: { type: 'integer' },
            content: { type: 'string' },
            messageType: { type: 'string', enum: ['TEXT', 'IMAGE', 'FILE'] },
            isEdited: { type: 'boolean' },
            editHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                  editedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MongoComment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            task_id: { type: 'integer', example: 123 },
            member_id: { type: 'integer', example: 456 },
            content: { type: 'string', example: '댓글 내용입니다.' },
            parent_id: { type: 'integer', nullable: true, example: 789 },
            mentions: {
              type: 'array',
              items: { type: 'integer' },
              example: [111, 222]
            },
            edit_history: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                  edited_at: { type: 'string', format: 'date-time' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' },
            statusCode: { type: 'integer' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        ActivityLog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            workspaceId: { type: 'integer' },
            userId: { type: 'integer' },
            action: { type: 'string' },
            description: { type: 'string' },
            targetType: { type: 'string' },
            targetId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        AttendanceRecord: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            workspaceId: { type: 'integer' },
            checkInTime: { type: 'string', format: 'date-time' },
            checkOutTime: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['PRESENT', 'ABSENT', 'LATE'] },
            date: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ]
  },
  apis: [
    './src/app/v1/**/*.ts',
    './src/app/v1/**/**/*.ts',
    './src/app/v1/**/**/**/*.ts',
    './src/app/v1/**/**/**/**/*.ts'
  ]
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TeamSphere API Documentation'
  }));
};

export default specs;
