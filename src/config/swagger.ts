import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TeamSphere API',
      version: '1.0.0',
      description: 'TeamSphere 팀 협업 플랫폼 API - 워크스페이스, 팀, 작업, 메시징을 위한 종합 API'
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'Auth', description: '인증 관련 API' },
      { name: 'Dashboard', description: '대시보드 API' },
      { name: 'User', description: '사용자 관리 API' },
      { name: 'Profile', description: '프로필 관리 API' },
      { name: 'Workspace', description: '워크스페이스 관리 API' },
      { name: 'Teams', description: '팀 관리 API' },
      { name: 'Tasks', description: '작업 관리 API (MySQL)' },
      { name: 'MongoTasks', description: 'MongoDB 작업 관리 API' },
      { name: 'Comments', description: '댓글 관리 API' },
      { name: 'Messages', description: '메시징 API' },
      { name: 'Activity', description: '활동 로그 API' },
      { name: 'Attendance', description: '출석 관리 API' }
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
        WorkspaceMember: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            workspaceId: { type: 'integer' },
            userId: { type: 'integer' },
            role: { type: 'string', enum: ['Admin', 'Manager', 'Member', 'Viewer'] },
            joinedAt: { type: 'string', format: 'date-time' }
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
        TeamMember: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            teamId: { type: 'integer' },
            userId: { type: 'integer' },
            role: { type: 'string', enum: ['Leader', 'Member'] },
            joinedAt: { type: 'string', format: 'date-time' }
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
    paths: {
      '/v1': {
        get: {
          tags: ['API'],
          summary: 'API 상태 확인',
          description: 'API 서버 상태를 확인합니다',
          responses: {
            200: {
              description: '성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Hello World' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/v1/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: '회원가입',
          description: '새 사용자를 등록합니다',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'username', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    username: { type: 'string' },
                    password: { type: 'string', minLength: 6 }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: '회원가입 성공',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            },
            400: {
              description: '잘못된 요청',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: '로그인',
          description: '사용자 로그인 및 JWT 토큰 발급',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: '로그인 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      token: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            401: {
              description: '인증 실패',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/v1/auth/logout': {
        get: {
          tags: ['Auth'],
          summary: '로그아웃',
          description: '사용자 로그아웃',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          responses: {
            200: {
              description: '로그아웃 성공',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/v1/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: '대시보드 데이터 조회',
          description: '사용자의 종합 대시보드 정보를 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          responses: {
            200: {
              description: '대시보드 데이터',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      profile: { $ref: '#/components/schemas/Profile' },
                      activityLog: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ActivityLog' }
                      },
                      attendanceRecords: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/AttendanceRecord' }
                      },
                      rooms: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Room' }
                      },
                      workspaces: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Workspace' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/v1/workspace': {
        get: {
          tags: ['Workspace'],
          summary: '워크스페이스 목록 조회',
          description: '사용자가 속한 워크스페이스 목록을 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          responses: {
            200: {
              description: '워크스페이스 목록',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Workspace' }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Workspace'],
          summary: '워크스페이스 생성',
          description: '새 워크스페이스를 생성합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: '워크스페이스 생성 성공',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Workspace' }
                }
              }
            }
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
