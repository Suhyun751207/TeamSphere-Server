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
      },
      {
        url: 'https://teamsphere-server-production.up.railway.app/',
        description: 'Production server'
      }
    ],
    tags: [
      { name: 'Auth', description: '인증 관련 API' },
      { name: 'Dashboard', description: '대시보드 API' },
      { name: 'User', description: '사용자 관리 API' },
      { name: 'Profile', description: '프로필 관리 API' },
      { name: 'Attendance', description: '출석 관리 API' },
      { name: 'DM Messages', description: 'DM 메시징 API' },
      { name: 'Workspace', description: '워크스페이스 관리 API' },
      { name: 'Members', description: '워크스페이스 멤버 관리 API' },
      { name: 'Activity Logs', description: '활동 로그 API' },
      { name: 'Teams', description: '팀 관리 API' },
      { name: 'Team Members', description: '팀 멤버 관리 API' },
      { name: 'Tasks', description: '작업 관리 API (MySQL)' },
      { name: 'MongoTasks', description: 'MongoDB 작업 관리 API' },
      { name: 'Comments', description: '댓글 관리 API' },
      { name: 'Messages', description: '워크스페이스/팀 메시징 API' }
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
          tags: ['Auth'],
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
                      message: { type: 'string', example: 'test' }
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
      },
      '/v1/user': {
        get: {
          tags: ['User'],
          summary: '현재 사용자 정보 조회',
          description: '인증된 사용자의 정보를 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          responses: {
            200: {
              description: '사용자 정보 조회 성공',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        patch: {
          tags: ['User'],
          summary: '비밀번호 변경 (로그인 상태)',
          description: '로그인된 사용자의 비밀번호를 변경합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['password', 'newPassword'],
                  properties: {
                    password: { type: 'string', description: '현재 비밀번호' },
                    newPassword: { type: 'string', description: '새 비밀번호' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: '비밀번호 변경 성공',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/v1/user/notlogin': {
        patch: {
          tags: ['User'],
          summary: '비밀번호 변경 (비로그인 상태)',
          description: '이메일로 비밀번호를 변경합니다',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'newPassword'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', description: '현재 비밀번호' },
                    newPassword: { type: 'string', description: '새 비밀번호' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: '비밀번호 변경 성공',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/v1/user/profile': {
        get: {
          tags: ['Profile'],
          summary: '모든 사용자 프로필 조회',
          description: '모든 사용자의 프로필 정보를 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          responses: {
            200: {
              description: '프로필 목록 조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Profile' }
                  }
                }
              }
            }
          }
        }
      },
      '/v1/user/rooms': {
        get: {
          tags: ['DM Messages'],
          summary: '사용자 DM 룸 목록 조회',
          description: '사용자의 DM 룸 목록을 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          responses: {
            200: {
              description: 'DM 룸 목록 조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        roomId: { type: 'integer' },
                        userId: { type: 'integer' },
                        room: { $ref: '#/components/schemas/Room' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/v1/workspace/{workspaceId}': {
        get: {
          tags: ['Workspace'],
          summary: '워크스페이스 상세 정보 조회',
          description: '특정 워크스페이스의 상세 정보를 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'workspaceId',
              required: true,
              schema: { type: 'integer' },
              description: '워크스페이스 ID'
            }
          ],
          responses: {
            200: {
              description: '워크스페이스 상세 정보',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Workspace' }
                }
              }
            }
          }
        }
      },
      '/v1/workspace/{workspaceId}/members': {
        get: {
          tags: ['Members'],
          summary: '워크스페이스 멤버 목록 조회',
          description: '특정 워크스페이스의 멤버 목록을 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'workspaceId',
              required: true,
              schema: { type: 'integer' },
              description: '워크스페이스 ID'
            }
          ],
          responses: {
            200: {
              description: '멤버 목록 조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/WorkspaceMember' }
                  }
                }
              }
            }
          }
        }
      },
      '/v1/workspace/{workspaceId}/Teams': {
        get: {
          tags: ['Teams'],
          summary: '워크스페이스 팀 목록 조회',
          description: '특정 워크스페이스의 모든 팀 목록을 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'workspaceId',
              required: true,
              schema: { type: 'integer' },
              description: '워크스페이스 ID'
            }
          ],
          responses: {
            200: {
              description: '팀 목록 조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Team' }
                  }
                }
              }
            }
          }
        }
      },
      '/v1/workspace/{workspaceId}/Teams/{teamId}/tasks': {
        get: {
          tags: ['Tasks'],
          summary: '팀 작업 목록 조회',
          description: '특정 팀의 모든 작업 목록을 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'workspaceId',
              required: true,
              schema: { type: 'integer' },
              description: '워크스페이스 ID'
            },
            {
              in: 'path',
              name: 'teamId',
              required: true,
              schema: { type: 'integer' },
              description: '팀 ID'
            }
          ],
          responses: {
            200: {
              description: '작업 목록 조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Tasks'],
          summary: '팀 작업 생성',
          description: '특정 팀에 새로운 작업을 생성합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'workspaceId',
              required: true,
              schema: { type: 'integer' },
              description: '워크스페이스 ID'
            },
            {
              in: 'path',
              name: 'teamId',
              required: true,
              schema: { type: 'integer' },
              description: '팀 ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['teamMemberId', 'state', 'priority'],
                  properties: {
                    teamMemberId: { type: 'integer' },
                    state: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] },
                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                    task: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: '작업 생성 성공',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Task' }
                }
              }
            }
          }
        }
      },
      '/v1/workspace/{workspaceId}/message': {
        get: {
          tags: ['Messages'],
          summary: '워크스페이스 내 모든 룸 조회',
          description: '특정 워크스페이스 내의 모든 룸을 조회합니다',
          security: [{ bearerAuth: [] }, { cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'workspaceId',
              required: true,
              schema: { type: 'integer' },
              description: '워크스페이스 ID'
            }
          ],
          responses: {
            200: {
              description: '룸 목록 조회 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        room: { $ref: '#/components/schemas/Room' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/v1/user/attendance/{userId}': {
        get: {
          tags: ['Attendance'],
          summary: '특정 사용자 출석 기록 조회',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: '출석 기록 조회 성공', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AttendanceRecord' } } } } }
          }
        }
      },
      '/v1/user/profile/me': {
        get: {
          tags: ['Profile'],
          summary: '현재 사용자 프로필 조회',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '사용자 프로필 조회 성공', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' }, profile: { $ref: '#/components/schemas/Profile' } } } } } }
          }
        }
      },
      '/v1/workspace/{workspaceId}/activityLog': {
        get: {
          tags: ['Activity Logs'],
          summary: '워크스페이스 활동 로그 조회',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: '활동 로그 조회 성공', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ActivityLog' } } } } }
          }
        },
        post: {
          tags: ['Activity Logs'],
          summary: '새 활동 로그 생성',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['action', 'description'], properties: { action: { type: 'string' }, description: { type: 'string' } } } } } },
          responses: {
            201: { description: '활동 로그 생성 성공', content: { 'application/json': { schema: { type: 'object' } } } }
          }
        }
      },
      '/v1/workspace/{workspaceId}/teams': {
        get: {
          tags: ['Teams'],
          summary: '워크스페이스 내 모든 팀 조회',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: '팀 목록 조회 성공', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Team' } } } } }
          }
        },
        post: {
          tags: ['Teams'],
          summary: '새 팀 생성',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } } } } },
          responses: {
            201: { description: '팀 생성 성공', content: { 'application/json': { schema: { type: 'object' } } } }
          }
        }
      },
      '/v1/workspace/{workspaceId}/teams/{teamId}': {
        get: {
          tags: ['Teams'],
          summary: '팀 상세 정보 조회',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: '팀 정보 조회 성공', content: { 'application/json': { schema: { type: 'object' } } } }
          }
        },
        patch: {
          tags: ['Teams'],
          summary: '팀 정보 수정',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } } },
          responses: {
            200: { description: '팀 수정 성공', content: { 'application/json': { schema: { type: 'object' } } } }
          }
        }
      },
      '/v1/workspace/{workspaceId}/teams/{teamId}/tasks': {
        get: {
          tags: ['Tasks'],
          summary: '팀 작업 목록 조회',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: '작업 목록 조회 성공', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } } } } }
          }
        },
        post: {
          tags: ['Tasks'],
          summary: '새 작업 생성',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { state: { type: 'string' }, priority: { type: 'string' }, task: { type: 'string' } } } } } },
          responses: {
            200: { description: '작업 생성 성공', content: { 'application/json': { schema: { type: 'object' } } } }
          }
        }
      },
      '/v1/workspace/{workspaceId}/teams/{teamId}/tasks/{taskId}/task': {
        get: {
          tags: ['MongoTasks'],
          summary: 'MongoDB 작업 목록 조회',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'taskId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'MongoDB 작업 조회 성공', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/MongoTask' } } } } }
          }
        },
        post: {
          tags: ['MongoTasks'],
          summary: '새 MongoDB 작업 생성',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'taskId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } }, attachments_path: { type: 'string' } } } } } },
          responses: {
            200: { description: 'MongoDB 작업 생성 성공', content: { 'application/json': { schema: { $ref: '#/components/schemas/MongoTask' } } } }
          }
        }
      },
      '/v1/workspace/{workspaceId}/teams/{teamId}/tasks/{taskId}/task/{taskId}/comments': {
        get: {
          tags: ['Comments'],
          summary: '댓글 목록 조회',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'taskId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: '댓글 목록 조회 성공', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/MongoComment' } } } } }
          }
        },
        post: {
          tags: ['Comments'],
          summary: '새 댓글 생성',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'taskId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' }, parent_id: { type: 'integer' } } } } } },
          responses: {
            200: { description: '댓글 생성 성공', content: { 'application/json': { schema: { $ref: '#/components/schemas/MongoComment' } } } }
          }
        }
      },
      '/v1/workspace/{workspaceId}/teams/{teamId}/message': {
        get: {
          tags: ['Messages'],
          summary: '팀 룸 목록 조회',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: '팀 룸 목록 조회 성공', content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } }
          }
        },
        post: {
          tags: ['Messages'],
          summary: '팀 룸 생성',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' } } } } } },
          responses: {
            201: { description: '팀 룸 생성 성공', content: { 'application/json': { schema: { type: 'object' } } } }
          }
        }
      },
      '/v1/workspace/{workspaceId}/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: '워크스페이스 대시보드 조회',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: '워크스페이스 대시보드 조회 성공', content: { 'application/json': { schema: { type: 'object' } } } }
          }
        }
      },
      '/v1/workspace/{workspaceId}/teams/{teamId}/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: '팀 대시보드 조회',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'workspaceId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'teamId', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: '팀 대시보드 조회 성공', content: { 'application/json': { schema: { type: 'object' } } } }
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
