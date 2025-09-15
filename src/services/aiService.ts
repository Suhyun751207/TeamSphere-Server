// src/services/aiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export interface AIResponse {
    action: string;
    parameters: {
        workspaceName?: string;
        teamName?: string;
        taskTitle?: string;
        clarificationType?: string;
        userEmail?: string;
        comment?: string;
        taskStatus?: string;
        [key: string]: any;
    };
    message: string;
}


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ConversationContext {
    userId: number;
    lastAction: string;
    pendingClarification?: {
        type: string;
        context: any;
    };
    conversationHistory: {
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    }[];
    timestamp: Date;
}

// 간단한 메모리 기반 컨텍스트 저장소 (실제로는 Redis나 DB 사용 권장)
const conversationContexts = new Map<number, ConversationContext>();

// 컨텍스트 정리를 위한 타이머 (1시간마다 오래된 컨텍스트 정리)
const CONTEXT_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1시간
const CONTEXT_MAX_AGE = 30 * 60 * 1000; // 30분

setInterval(() => {
    const now = new Date();
    for (const [userId, context] of conversationContexts.entries()) {
        if (now.getTime() - context.timestamp.getTime() > CONTEXT_MAX_AGE) {
            conversationContexts.delete(userId);
            console.log(`오래된 컨텍스트 정리: userId ${userId}`);
        }
    }
}, CONTEXT_CLEANUP_INTERVAL);

export function getConversationContext(userId: number): ConversationContext | null {
    const context = conversationContexts.get(userId);
    if (!context) return null;
    
    // 컨텍스트 유효성 검사
    const now = new Date();
    if (now.getTime() - context.timestamp.getTime() > CONTEXT_MAX_AGE) {
        conversationContexts.delete(userId);
        return null;
    }
    
    return context;
}

export function setConversationContext(userId: number, context: ConversationContext): void {
    // 컨텍스트 크기 제한 (메모리 관리)
    if (context.conversationHistory.length > 20) {
        context.conversationHistory = context.conversationHistory.slice(-10);
    }
    
    conversationContexts.set(userId, { ...context, timestamp: new Date() });
}

export function addConversationMessage(userId: number, role: 'user' | 'assistant', content: string): void {
    const context = getConversationContext(userId);
    if (context) {
        // 메시지 길이 제한 (너무 긴 메시지는 자르기)
        const truncatedContent = content.length > 1000 ? content.substring(0, 1000) + '...' : content;
        
        context.conversationHistory.push({
            role,
            content: truncatedContent,
            timestamp: new Date()
        });
        
        // 대화 기록 크기 제한
        if (context.conversationHistory.length > 20) {
            context.conversationHistory = context.conversationHistory.slice(-10);
        }
        
        setConversationContext(userId, context);
    }
}

export function clearConversationContext(userId: number): void {
    conversationContexts.delete(userId);
}

export function getConversationStats(): { totalContexts: number; oldestContext?: Date; newestContext?: Date } {
    const contexts = Array.from(conversationContexts.values());
    if (contexts.length === 0) {
        return { totalContexts: 0 };
    }
    
    const timestamps = contexts.map(c => c.timestamp);
    return {
        totalContexts: contexts.length,
        oldestContext: new Date(Math.min(...timestamps.map(t => t.getTime()))),
        newestContext: new Date(Math.max(...timestamps.map(t => t.getTime())))
    };
}

export async function processUserMessageWithContext(message: string, userId: number): Promise<AIResponse> {
    // 사용자 메시지를 대화 기록에 추가
    addConversationMessage(userId, 'user', message);

    // 이전 컨텍스트 확인
    const context = getConversationContext(userId);

    if (context?.pendingClarification) {
        // 이전 clarification에 대한 응답 처리
        const clarificationResponse = await processClarificationResponse(message, context.pendingClarification);
        if (clarificationResponse) {
            // 어시스턴트 응답을 대화 기록에 추가
            addConversationMessage(userId, 'assistant', clarificationResponse.message);
            clearConversationContext(userId);
            return clarificationResponse;
        }
    }

    // 일반 AI 처리 (대화 기록 포함)
    const existingHistory = context?.conversationHistory || [];
    const fullHistory = [...existingHistory, { role: 'user' as const, content: message, timestamp: new Date() }];
    const aiResponse = await processUserMessage(message, fullHistory);

    // 어시스턴트 응답을 대화 기록에 추가
    addConversationMessage(userId, 'assistant', aiResponse.message);

    // clarification_needed일 경우 컨텍스트 저장
    if (aiResponse.action === 'clarification_needed') {
        const existingContext = getConversationContext(userId);
        setConversationContext(userId, {
            userId,
            lastAction: aiResponse.action,
            pendingClarification: {
                type: aiResponse.parameters.clarificationType,
                context: aiResponse.parameters
            },
            conversationHistory: fullHistory, // 전체 대화 기록 포함
            timestamp: new Date()
        });
    }

    return aiResponse;
}

async function processClarificationResponse(message: string, clarification: { type: string; context: any }): Promise<AIResponse | null> {
    // 이름 추출 로직 적용
    let extractedName = message.trim();
    
    console.log('Clarification Response - 원본 메시지:', message);
    
    // 패턴 1: "이름은 [이름]으로 할래" - "이름은 tser로 할래"
    const nameWithEulPattern = /이름은\s*([a-zA-Z0-9가-힣\s\-_]+)(?:으로|로|로서|라는|라고)\s*(?:할래|할게|해줘|하고 싶어|생각해)$/i;
    
    // 패턴 2: "이름은 [이름]이야" - 기존 패턴
    const namePattern = /이름은\s*([a-zA-Z0-9가-힣\s\-_]+)(이야|입니다|예요|야)$/i;
    
    // 패턴 3: "[이름]이야" - 간단한 이름 응답
    const simpleNamePattern = /^([a-zA-Z0-9가-힣\s\-_]+)(이야|입니다|예요|야)$/i;
    
    // 패턴 4: "[이름]으로 할래" - 간단한 이름 + 으로 할래
    const simpleWithEulPattern = /^([a-zA-Z0-9가-힣\s\-_]+)(?:으로|로)\s*(?:할래|할게|해줘)$/i;
    
    // 패턴 5: "이름은 [이름]" - 단순 선언
    const simpleDeclarationPattern = /이름은\s*([a-zA-Z0-9가-힣\s\-_]+)$/i;
    
    // 순서대로 패턴 매칭 시도
    let nameMatch = message.match(nameWithEulPattern);
    if (!nameMatch) nameMatch = message.match(namePattern);
    if (!nameMatch) nameMatch = message.match(simpleNamePattern);
    if (!nameMatch) nameMatch = message.match(simpleWithEulPattern);
    if (!nameMatch) nameMatch = message.match(simpleDeclarationPattern);
    
    console.log('Clarification 패턴 매칭 결과:', nameMatch);
    
    if (nameMatch) {
        extractedName = nameMatch[1].trim();
        console.log('Clarification에서 추출된 이름:', extractedName);
    }
    
    switch (clarification.type) {
        case 'workspace_name':
            if (extractedName.length > 0 && extractedName.length < 50) {
                const validNamePattern = /^[a-zA-Z0-9가-힣\s\-_]+$/;
                if (validNamePattern.test(extractedName)) {
                    return {
                        action: 'create_workspace',
                        parameters: { workspaceName: extractedName },
                        message: `"${extractedName}" 워크스페이스를 생성하겠습니다.`
                    };
                }
            }
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'workspace_name' },
                message: '워크스페이스 이름을 다시 알려주세요. 예: "프로젝트A" 또는 "이름은 MyProject로 할래"와 같이 말씀해 주세요.'
            };
        case 'team_name':
            if (extractedName.length > 0 && extractedName.length < 50) {
                const validNamePattern = /^[a-zA-Z0-9가-힣\s\-_]+$/;
                if (validNamePattern.test(extractedName)) {
                    return {
                        action: 'create_team',
                        parameters: { teamName: extractedName },
                        message: `"${extractedName}" 팀을 생성하겠습니다.`
                    };
                }
            }
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'team_name' },
                message: '팀 이름을 다시 알려주세요. 예: "개발팀" 또는 "이름은 마케팅팀으로 할래"와 같이 말씀해 주세요.'
            };
        case 'task_title':
            if (extractedName.length > 0 && extractedName.length < 100) {
                return {
                    action: 'create_task',
                    parameters: { taskTitle: extractedName },
                    message: `"${extractedName}" 작업을 생성하겠습니다.`
                };
            }
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'task_title' },
                message: '작업 제목을 다시 알려주세요. 예: "로그인 기능 개발" 또는 "이름은 UI 수정으로 할래"와 같이 말씀해 주세요.'
            };
        case 'member_email':
            return {
                action: 'add_workspace_member',
                parameters: {
                    workspaceName: clarification.context.workspaceName,
                    userEmail: message.trim()
                },
                message: `"${clarification.context.workspaceName}" 워크스페이스에 "${message.trim()}"님을 추가하겠습니다.`
            };
        case 'comment_text':
            return {
                action: 'create_comment',
                parameters: {
                    taskTitle: clarification.context.taskTitle,
                    comment: message.trim()
                },
                message: `"${clarification.context.taskTitle}" 작업에 댓글을 달겠습니다.`
            };
        case 'task_status':
            return {
                action: 'update_task_status',
                parameters: {
                    taskTitle: clarification.context.taskTitle,
                    taskStatus: message.trim().toUpperCase()
                },
                message: `"${clarification.context.taskTitle}" 작업 상태를 "${message.trim()}"으로 변경하겠습니다.`
            };
        default:
            return null;
    }
}

export async function processUserMessage(message: string, conversationHistory: { role: 'user' | 'assistant'; content: string; timestamp: Date; }[] = []): Promise<AIResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // 대화 기록을 포함한 프롬프트 생성
        let conversationContext = '';
        if (conversationHistory.length > 0) {
            conversationContext = '\n\n이전 대화 기록:\n';
            conversationHistory.slice(-5).forEach((msg, index) => {
                conversationContext += `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}\n`;
            });
            conversationContext += '\n위 대화 기록을 고려하여 현재 요청을 처리하세요.\n';
        }

        const prompt = `
            당신은 TeamSphere 워크스페이스 관리 AI 어시스턴트입니다.
            사용자의 한국어 메시지를 분석하여 **반드시 아래 JSON 형식으로만 응답**하세요.

            출력 형식(JSON):
            {
            "action": string,                // 수행할 동작
            "parameters": object,            // 동작에 필요한 매개변수
            "message": string               // 사용자에게 보여줄 메시지
            }
            
            ==================================================
            ✅ 대화 맥락 처리 규칙
            1. 직전 assistant 메시지가 clarification 요청이었다면, 사용자 응답을 이름으로 간주
{{ ... }}
            - update_profile      (parameters: {field, value})
            - attendance_check    (parameters: {})
            - general_chat        (parameters: {type, content?})
            - clarification_needed (parameters: {clarificationType: "workspace_name" | "team_name" | "task_title"})

            ==================================================
            ✅ 일반 대화 유형 (general_chat)
            - greeting: 인사 (안녕, hello, hi 등)
            - goodbye: 작별 인사 (잘 가, bye, goodbye 등)
            - introduction: 자기소개 요청 (너는 뭐야?, 누구야? 등)
            - capabilities: 기능 설명 요청 (뭐 할 수 있어?, 무슨 기능? 등)
            - detailed_capabilities: 상세 기능 설명 요청 (너가 뭘 할 수 있지? 등)
            - role: 역할 설명 요청 (너의 역할은?, 뭐하는 거야? 등)
            - time: 시간 질문 (현재 시간은?, 지금 몇 시야? 등)
            - date: 날짜 질문 (오늘 몇일이야?, 현재 날짜는? 등)
            - weather: 날씨 질문 (현재 날씨?, 오늘 날씨 어때? 등)
            - system_explanation: 시스템 설명 요청 (이 웹 뭐야?, TeamSphere 설명 등)
            - emotion: 감정 표현 (힘들어, 피곤해, 좋아, 신나 등)
            - praise: 칭찬 표현 (최고, 대단해, 잘했어, 굿 등)
            - general: 일반 대화 (20자 미만의 간단한 텍스트)
            - question: 일반 질문 (어떻게, 왜, 무엇, 뭐, 누가, 언제, 어디서로 시작)
            - thanks: 감사 표현 (고마워, 감사합니다, thanks 등)

            사용자: "개발팀이야"
            AI: {"action":"create_team","parameters":{"teamName":"개발팀"},"message":"\"개발팀\" 팀을 생성하겠습니다."}

            3) 작업 생성
            사용자: "작업 추가해줘"
            AI: {"action":"clarification_needed","parameters":{"clarificationType":"task_title"},"message":"작업 제목을 알려주세요."}
            사용자: "로그인 기능 개발"
            AI: {"action":"create_task","parameters":{"taskTitle":"로그인 기능 개발"},"message":"\"로그인 기능 개발\" 작업을 생성하겠습니다."}

            4) 특정 워크스페이스에 팀 생성
            사용자: "ii 워크스페이스에 팀 만들어줘"
            AI: {"action":"clarification_needed","parameters":{"clarificationType":"team_name"},"message":"어떤 이름으로 팀을 만들까요?"}
            사용자: "iier"
            AI: {"action":"create_team","parameters":{"teamName":"iier","workspaceName":"ii"},"message":"\"ii\" 워크스페이스에 \"iier\" 팀을 생성하겠습니다."}

            5) 특정 워크스페이스에 팀 생성 (한 번에)
            사용자: "ii 워크스페이스에 iier 팀을 만들어줘"
            AI: {"action":"create_team","parameters":{"teamName":"iier","workspaceName":"ii"},"message":"\"ii\" 워크스페이스에 \"iier\" 팀을 생성하겠습니다."}

            6) "~로 할래" 패턴 (중요!)
            사용자: "워크스페이스 만들어줘"
            AI: {"action":"clarification_needed","parameters":{"clarificationType":"workspace_name"},"message":"어떤 이름으로 워크스페이스를 만들까요?"}
            사용자: "이름은 tser로 할래"
            AI: {"action":"create_workspace","parameters":{"workspaceName":"tser"},"message":"\"tser\" 워크스페이스를 생성하겠습니다."}

            7) 활동 로그 생성
            사용자: "ii 워크스페이스에 활동 로그로 ai봇 제작 중 이라고 해줘"
            AI: {"action":"create_activity_log","parameters":{"message":"ai봇 제작 중","workspaceName":"ii"},"message":"\"ii\" 워크스페이스에 \"ai봇 제작 중\" 활동 로그를 생성하겠습니다."}

            8) 활동 로그 생성 (기본 워크스페이스)
            사용자: "활동 로그로 코드 리뷰 완료라고 기록해줘"
            AI: {"action":"create_activity_log","parameters":{"message":"코드 리뷰 완료"},"message":"활동 로그에 \"코드 리뷰 완료\"를 기록하겠습니다."}

            5) 불완전 응답
            사용자: "음... 잘 모르겠어"
            AI: {"action":"clarification_needed","parameters":{"clarificationType":"workspace_name"},"message":"워크스페이스 이름을 다시 알려주세요. 예: \"프로젝트A\"와 같이 말씀해 주세요."}

            6) 출석체크
            사용자: "출석체크 해줘"
            AI: {"action":"attendance_check","parameters":{},"message":""}
            사용자: "출석 확인해줘"
            AI: {"action":"attendance_check","parameters":{},"message":""}
            사용자: "오늘 출석"
            AI: {"action":"attendance_check","parameters":{},"message":""}

            ==================================================
            ✅ 워크스페이스/팀 이름 추출 규칙
            1. "[워크스페이스명] 워크스페이스에 [팀명] 팀 만들어줘" → workspaceName: "[워크스페이스명]", teamName: "[팀명]"
            2. "[워크스페이스명]에 팀 만들어줘" → workspaceName: "[워크스페이스명]", clarification_needed for teamName
            3. "팀 만들어줘" → clarification_needed for teamName (기본 워크스페이스 사용)
            4. "내가 지금 [워크스페이스명] 워크스페이스에 team을 하나 만들어줘, 이름은 [팀명]로 해줘" → workspaceName: "[워크스페이스명]", teamName: "[팀명]"
            5. 워크스페이스명은 "워크스페이스", "ws", "workspace" 등의 키워드와 함께 언급된 이름을 추출
            6. 팀명은 "팀", "team" 등의 키워드와 함께 언급된 이름을 추출

            ==================================================
            현재 대화 기록:
            ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
            
            ==================================================
            현재 사용자 메시지: "${message}"

            위 모든 규칙, 시나리오, 대화 맥락을 고려하여 적절한 JSON 하나만 출력하세요.
            **절대 JSON 외의 다른 텍스트를 포함하지 마세요!**
            `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text().trim();

        // JSON 응답에서 불필요한 텍스트 제거
        if (text.includes('```json')) {
            text = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        }
        if (text.includes('```')) {
            text = text.replace(/```[^`]*```/g, '').trim();
        }

        console.log('AI Raw Response:', text);
        console.log('Conversation History:', conversationHistory);

        try {
            const parsed = JSON.parse(text);
            console.log('Parsed AI Response:', parsed);
            return parsed;
        } catch (parseError) {
            console.error('JSON 파싱 실패:', parseError);
            console.error('파싱 실패한 텍스트:', text);

            // 수동 파싱 시도
            const fallbackResponse = parseFallbackResponse(text, conversationHistory);
            console.log('Fallback Response:', fallbackResponse);
            if (fallbackResponse) {
                return fallbackResponse;
            }

            return {
                action: 'unknown',
                parameters: {},
                message: '죄송합니다. 요청을 이해하지 못했습니다. 다시 말씀해 주세요.'
            };
        }
    } catch (error) {
        console.error('AI 서비스 오류:', error);
        return {
            action: 'error',
            parameters: {},
            message: 'AI 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        };
    }
}

function parseFallbackResponse(text: string, conversationHistory: { role: 'user' | 'assistant'; content: string; timestamp: Date; }[] = []): AIResponse | null {
    try {
        // 텍스트 정리 (공백 제거, 소문자 변환)
        const cleanText = text.trim().toLowerCase();
        
        // 이전 대화에서 워크스페이스 이름을 요청했는지 확인
        const lastAssistantMessage = conversationHistory
            .slice()
            .reverse()
            .find(msg => msg.role === 'assistant' &&
                (msg.content.includes('워크스페이스를 만들까요') ||
                    msg.content.includes('이름으로 워크스페이스를 만들까요') ||
                    msg.content.includes('워크스페이스 이름')));

        // 사용자 응답에서 이름 추출 (다양한 패턴 지원)
        let extractedName = ''; // 초기값을 빈 문자열로 설정
        
        console.log('Fallback 파싱 - 원본 텍스트:', text);
        
        // 패턴 1: "이름은 [이름]으로 할래" - "이름은 tser로 할래"
        const nameWithEulPattern = /이름은\s*([a-zA-Z0-9가-힣\s\-_]+)(?:으로|로|로서|라는|라고)\s*(?:할래|할게|해줘|하고 싶어|생각해)$/i;
        
        // 패턴 2: "이름은 [이름]이야" - 기존 패턴
        const namePattern = /이름은\s*([a-zA-Z0-9가-힣\s\-_]+)(이야|입니다|예요|야)$/i;
        
        // 패턴 3: "[이름]이야" - 간단한 이름 응답
        const simpleNamePattern = /^([a-zA-Z0-9가-힣\s\-_]+)(이야|입니다|예요|야)$/i;
        
        // 패턴 4: "[이름]으로 할래" - 간단한 이름 + 으로 할래
        const simpleWithEulPattern = /^([a-zA-Z0-9가-힣\s\-_]+)(?:으로|로)\s*(?:할래|할게|해줘)$/i;
        
        // 패턴 5: "이름은 [이름]" - 단순 선언
        const simpleDeclarationPattern = /이름은\s*([a-zA-Z0-9가-힣\s\-_]+)$/i;
        
        // 순서대로 패턴 매칭 시도
        let nameMatch = text.match(nameWithEulPattern);
        if (!nameMatch) nameMatch = text.match(namePattern);
        if (!nameMatch) nameMatch = text.match(simpleNamePattern);
        if (!nameMatch) nameMatch = text.match(simpleWithEulPattern);
        if (!nameMatch) nameMatch = text.match(simpleDeclarationPattern);
        
        console.log('패턴 매칭 결과:', nameMatch);
        
        if (nameMatch) {
            extractedName = nameMatch[1].trim();
            console.log('추출된 이름:', extractedName);
        }

        // 이전 대화에서 워크스페이스 이름을 요청했고, 사용자가 이름을 제공한 경우
        if (lastAssistantMessage && extractedName.length > 0 && extractedName.length < 50) {
            console.log('워크스페이스 이름 확인 요청 감지, 추출된 이름:', extractedName);
            // 간단한 이름인지 확인 (특수문자나 명령어가 아닌 경우)
            const validNamePattern = /^[a-zA-Z0-9가-힣\s\-_]+$/;
            if (validNamePattern.test(extractedName)) {
                console.log('유효한 이름으로 워크스페이스 생성');
                return {
                    action: 'create_workspace',
                    parameters: { workspaceName: extractedName },
                    message: `"${extractedName}" 워크스페이스를 생성하겠습니다.`
                };
            } else {
                console.log('유효하지 않은 이름 패턴:', extractedName);
            }
        } else if (lastAssistantMessage) {
            console.log('이름 추출 실패 또는 이름이 너무 김:', extractedName);
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'workspace_name' },
                message: '워크스페이스 이름을 다시 알려주세요. 예: "프로젝트A" 또는 "이름은 MyProject로 할래"와 같이 말씀해 주세요.'
            };
        }

        // 이전 대화에서 팀 이름을 요청했는지 확인
        const lastTeamMessage = conversationHistory
            .slice()
            .reverse()
            .find(msg => msg.role === 'assistant' &&
                (msg.content.includes('팀을 만들까요') ||
                    msg.content.includes('이름으로 팀을 만들까요') ||
                    msg.content.includes('팀 이름')));

        // 이전 대화에서 팀 이름을 요청했고, 사용자가 이름을 제공한 경우
        if (lastTeamMessage && extractedName.length > 0 && extractedName.length < 50) {
            console.log('팀 이름 확인 요청 감지, 추출된 이름:', extractedName);
            const validNamePattern = /^[a-zA-Z0-9가-힣\s\-_]+$/;
            if (validNamePattern.test(extractedName)) {
                console.log('유효한 이름으로 팀 생성');
                return {
                    action: 'create_team',
                    parameters: { teamName: extractedName },
                    message: `"${extractedName}" 팀을 생성하겠습니다.`
                };
            } else {
                console.log('유효하지 않은 팀 이름 패턴:', extractedName);
            }
        } else if (lastTeamMessage) {
            console.log('팀 이름 추출 실패 또는 이름이 너무 김:', extractedName);
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'team_name' },
                message: '팀 이름을 다시 알려주세요. 예: "개발팀" 또는 "이름은 마케팅팀으로 할래"와 같이 말씀해 주세요.'
            };
        }

        // 이전 대화에서 작업 제목을 요청했는지 확인
        const lastTaskMessage = conversationHistory
            .slice()
            .reverse()
            .find(msg => msg.role === 'assistant' &&
                (msg.content.includes('작업을 만들까요') ||
                    msg.content.includes('작업 제목을 알려주세요') ||
                    msg.content.includes('작업 제목')));

        // 이전 대화에서 작업 제목을 요청했고, 사용자가 제목을 제공한 경우
        if (lastTaskMessage && extractedName.length > 0 && extractedName.length < 100) {
            console.log('작업 제목 확인 요청 감지, 추출된 제목:', extractedName);
            console.log('유효한 제목으로 작업 생성');
            return {
                action: 'create_task',
                parameters: { taskTitle: extractedName },
                message: `"${extractedName}" 작업을 생성하겠습니다.`
            };
        } else if (lastTaskMessage) {
            console.log('작업 제목 추출 실패 또는 제목이 너무 김:', extractedName);
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'task_title' },
                message: '작업 제목을 다시 알려주세요. 예: "로그인 기능 개발" 또는 "이름은 UI 수정으로 할래"와 같이 말씀해 주세요.'
            };
        }
        // 워크스페이스 생성 패턴 (불완전한 요청)
        const incompleteWorkspaceMatch = text.match(/(?:워크스페이스|workspace)[ ]*(?:생성|만들|create|만들어|해|줘)[ ]*$/i);
        if (incompleteWorkspaceMatch) {
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'workspace_name' },
                message: '어떤 이름으로 워크스페이스를 만들까요? 워크스페이스 이름을 알려주세요.'
            };
        }

        // 팀 생성 패턴 (불완전한 요청)
        const incompleteTeamMatch = text.match(/(?:팀|team)[ ]*(?:생성|만들|create|만들어|해|줘)[ ]*$/i);
        if (incompleteTeamMatch) {
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'team_name' },
                message: '어떤 이름으로 팀을 만들까요? 팀 이름을 알려주세요.'
            };
        }

        // 작업 생성 패턴 (불완전한 요청)
        const incompleteTaskMatch = text.match(/(?:작업|task)[ ]*(?:생성|만들|create|만들어|해|줘)[ ]*$/i);
        if (incompleteTaskMatch) {
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'task_title' },
                message: '어떤 작업을 만들까요? 작업 제목을 알려주세요.'
            };
        }

        // 워크스페이스 멤버 추가 패턴 (불완전한 요청)
        const incompleteMemberMatch = text.match(/(?:워크스페이스|workspace)[ ]*(?:에|to)[ ]*([^ ]+)[ ]*(?:추가|초대|add)[ ]*$/i);
        if (incompleteMemberMatch) {
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'member_email', workspaceName: incompleteMemberMatch[1] },
                message: `"${incompleteMemberMatch[1]}" 워크스페이스에 누구를 추가할까요? 이메일 주소를 알려주세요.`
            };
        }

        // 팀 멤버 추가 패턴 (불완전한 요청)
        const incompleteTeamMemberMatch = text.match(/(?:팀|team)[ ]*(?:에|to)[ ]*([^ ]+)[ ]*(?:추가|add)[ ]*$/i);
        if (incompleteTeamMemberMatch) {
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'member_email', teamName: incompleteTeamMemberMatch[1] },
                message: `"${incompleteTeamMemberMatch[1]}" 팀에 누구를 추가할까요? 이메일 주소를 알려주세요.`
            };
        }

        // 댓글 생성 패턴 (불완전한 요청)
        const incompleteCommentMatch = text.match(/([^ ]+)[ ]*(?:작업|task)[ ]*(?:에|to)[ ]*(?:댓글|코멘트|comment)[ ]*$/i);
        if (incompleteCommentMatch) {
            return {
                action: 'clarification_needed',
                parameters: { clarificationType: 'comment_text', taskTitle: incompleteCommentMatch[1] },
                message: `"${incompleteCommentMatch[1]}" 작업에 어떤 댓글을 달까요?`
            };
        }

        // 작업 상태 변경 패턴
        const updateTaskMatch = text.match(/([^ ]+)[ ]*(?:작업|task)[ ]*(?:상태|status)[ ]*(?:를|을)[ ]*([^ ]+)[ ]*(?:으로|로)/i);
        if (updateTaskMatch) {
            return {
                action: 'update_task_status',
                parameters: {
                    taskTitle: updateTaskMatch[1],
                    taskStatus: updateTaskMatch[2]
                },
                message: `"${updateTaskMatch[1]}" 작업 상태를 "${updateTaskMatch[2]}"으로 변경하겠습니다.`
            };
        }

        // 댓글 생성 패턴
        const commentMatch = text.match(/([^ ]+)[ ]*(?:작업|task)[ ]*(?:에|to)[ ]*([^ ]+)[ ]*(?:댓글|코멘트|comment)/i);
        if (commentMatch) {
            return {
                action: 'create_comment',
                parameters: {
                    taskTitle: commentMatch[1],
                    comment: commentMatch[2]
                },
                message: `"${commentMatch[1]}" 작업에 댓글을 달겠습니다.`
            };
        }

        // 댓글 조회 패턴
        if (/(?:댓글|코멘트|comment)[\s]*(?:보여|표시|조회|보여줘|표시해줘|조회해줘)/i.test(text)) {
            return {
                action: 'get_comments',
                parameters: {},
                message: '최근 댓글들을 조회하겠습니다.'
            };
        }

        // 출석 체크 패턴
        if (/(?:출석|attendance|체크|check)/i.test(text)) {
            return {
                action: 'check_attendance',
                parameters: {},
                message: '출석을 체크하겠습니다.'
            };
        }

        // 활동 로그 조회 패턴
        if (/(?:활동|activity|로그|기록)/i.test(text) && /(?:보여|표시|조회)/i.test(text)) {
            return {
                action: 'get_activity_logs',
                parameters: {},
                message: '활동 로그를 조회하겠습니다.'
            };
        }

        // 팀 조회 패턴
        if (/(?:팀|team)[\s]*(?:목록|리스트|list|보여|표시|조회|보여줘|표시해줘|조회해줘|알려|알려줘)/i.test(text)) {
            return {
                action: 'get_teams',
                parameters: {},
                message: '내가 속한 팀 목록을 조회하겠습니다.'
            };
        }

        // 워크스페이스 조회 패턴
        if (/(?:워크스페이스|workspace)[\s]*(?:목록|리스트|list|보여|표시|조회|보여줘|표시해줘|조회해줘|알려|알려줘)/i.test(text)) {
            return {
                action: 'get_workspaces',
                parameters: {},
                message: '내가 속한 워크스페이스 목록을 조회하겠습니다.'
            };
        }

        // 활동 로그 생성 패턴 - 특정 워크스페이스
        const activityLogWithWorkspaceMatch = text.match(/([^ ]+)[ ]*(?:워크스페이스|workspace)[ ]*(?:에|to)[ ]*(?:활동|activity)[ ]*(?:로그|log)[ ]*(?:로|as)[ ]*([^ ]+)[ ]*(?:라고|라고고)[ ]*(?:해줘|기록해줘|만들어줘|해달라고)/i);
        if (activityLogWithWorkspaceMatch) {
            return {
                action: 'create_activity_log',
                parameters: {
                    workspaceName: activityLogWithWorkspaceMatch[1],
                    message: activityLogWithWorkspaceMatch[2]
                },
                message: `"${activityLogWithWorkspaceMatch[1]}" 워크스페이스에 "${activityLogWithWorkspaceMatch[2]}" 활동 로그를 생성하겠습니다.`
            };
        }

        // 활동 로그 생성 패턴 - "내가 지금 [워크스페이스]에 활동 로그로 [메시지]라고 해줘" 형식
        const detailedActivityLogMatch = text.match(/내가 지금[ ]*([^ ]+)[ ]*(?:워크스페이스|workspace)[ ]*(?:에|to)[ ]*(?:활동|activity)[ ]*(?:로그|log)[ ]*(?:로|as)[ ]*([^가-힣]+?)[ ]*(?:라고|라고고)[ ]*(?:해줘|기록해줘|만들어줘)/i);
        if (detailedActivityLogMatch) {
            return {
                action: 'create_activity_log',
                parameters: {
                    workspaceName: detailedActivityLogMatch[1],
                    message: detailedActivityLogMatch[2].trim()
                },
                message: `"${detailedActivityLogMatch[1]}" 워크스페이스에 "${detailedActivityLogMatch[2].trim()}" 활동 로그를 생성하겠습니다.`
            };
        }

        // 활동 로그 생성 패턴 - "내가 지금 [워크스페이스]에 활동 로그로 [메시지]라고 해줘" (공백 포함)
        const detailedActivityLogWithSpacesMatch = text.match(/내가 지금[ ]*([^ ]+)[ ]*(?:워크스페이스|workspace)[ ]*(?:에|to)[ ]*(?:활동|activity)[ ]*(?:로그|log)[ ]*(?:로|as)[ ]*([^가-힣]+?)[ ]*(?:라고|라고고)[ ]*(?:해줘|기록해줘|만들어줘)/i);
        if (detailedActivityLogWithSpacesMatch) {
            return {
                action: 'create_activity_log',
                parameters: {
                    workspaceName: detailedActivityLogWithSpacesMatch[1],
                    message: detailedActivityLogWithSpacesMatch[2].trim()
                },
                message: `"${detailedActivityLogWithSpacesMatch[1]}" 워크스페이스에 "${detailedActivityLogWithSpacesMatch[2].trim()}" 활동 로그를 생성하겠습니다.`
            };
        }

        // 활동 로그 생성 패턴 - 기본 워크스페이스
        const activityLogMatch = text.match(/(?:활동|activity)[ ]*(?:로그|log)[ ]*(?:로|as)[ ]*([^ ]+)[ ]*(?:라고|라고고)[ ]*(?:해줘|기록해줘|만들어줘|해달라고)/i);
        if (activityLogMatch) {
            return {
                action: 'create_activity_log',
                parameters: {
                    message: activityLogMatch[1]
                },
                message: `활동 로그에 "${activityLogMatch[1]}"를 기록하겠습니다.`
            };
        }

        // 활동 로그 생성 패턴 - "~라고 해줘" 형식
        const activityLogRequestMatch = text.match(/([^ ]+)[ ]*(?:워크스페이스|workspace)[ ]*(?:에|to)[ ]*(?:활동|activity)[ ]*(?:로그|log)[ ]*(?:로|as)[ ]*([^ ]+)[ ]*(?:라고|라고고)[ ]*(?:해줘|기록해줘|만들어줘)/i);
        if (activityLogRequestMatch) {
            return {
                action: 'create_activity_log',
                parameters: {
                    workspaceName: activityLogRequestMatch[1],
                    message: activityLogRequestMatch[2]
                },
                message: `"${activityLogRequestMatch[1]}" 워크스페이스에 "${activityLogRequestMatch[2]}" 활동 로그를 생성하겠습니다.`
            };
        }

        // 프로필 수정 패턴 - "내 프로필 [필드]를 [값]으로 바꿔줘"
        const profileUpdateMatch = text.match(/내[ ]*(?:프로필|profile)[ ]*([^ ]+)[ ]*(?:를|을)[ ]*([^ ]+)[ ]*(?:으로|로)[ ]*(?:바꿔줘|변경해줘|수정해줘)/i);
        if (profileUpdateMatch) {
            const field = profileUpdateMatch[1];
            const value = profileUpdateMatch[2];
            
            // 필드명 정규화
            let normalizedField = field;
            if (/(?:나이|age)/i.test(field)) {
                normalizedField = 'age';
            } else if (/(?:이름|name)/i.test(field)) {
                normalizedField = 'name';
            } else if (/(?:이메일|email)/i.test(field)) {
                normalizedField = 'email';
            }
            
            return {
                action: 'update_profile',
                parameters: {
                    field: normalizedField,
                    value: value
                },
                message: `프로필의 ${field}를 ${value}(으)로 변경하겠습니다.`
            };
        }

        // 프로필 조회 패턴
        if (/(?:프로필|profile)/i.test(text) && /(?:보여|표시|조회)/i.test(text)) {
            return {
                action: 'get_user_profile',
                parameters: {},
                message: '프로필 정보를 조회하겠습니다.'
            };
        }

        // 대시보드 조회 패턴
        if (/(?:대시보드|dashboard)/i.test(text) && /(?:보여|표시|조회)/i.test(text)) {
            return {
                action: 'get_dashboard',
                parameters: {},
                message: '대시보드를 조회하겠습니다.'
            };
        }

        // 인사 패턴
        const greetingMatch = text.match(/^(안녕|안녕하세요|안녕하십니까|안녕하냐|하이|헬로우|hello|hi)$/i);
        if (greetingMatch) {
            return {
                action: 'general_chat',
                parameters: {
                    type: 'detailed_capabilities'
                },
                message: '저는 다음과 같은 다양한 기능을 제공합니다:\n\n🏢 **워크스페이스 관리**: 워크스페이스 생성, 멤버 추가\n👥 **팀 관리**: 팀 생성, 팀 멤버 관리\n✅ **작업 관리**: 작업 생성, 상태 업데이트, 댓글 추가\n📝 **활동 로그**: 워크스페이스별 활동 기록\n👤 **프로필 관리**: 이름, 나이, 이메일 수정\n📊 **정보 조회**: 프로필, 대시보드, 활동 로그 조회\n\n자연어로 말씀해주시면 제가 알아서 처리해드릴게요!'
            };
        }

        // 웹사이트/시스템 설명 패턴
        const systemMatch = text.match(/(?:이 웹|이 사이트|이 시스템|TeamSphere|팀스피어)[ ]*(?:뭐야|무엇|어떤|설명|소개)/i);
        if (systemMatch) {
            return {
                action: 'general_chat',
                parameters: {
                    type: 'system_explanation'
                },
                message: 'TeamSphere는 팀 협업 및 프로젝트 관리 플랫폼입니다. 워크스페이스를 생성하고 팀을 구성하여 프로젝트를 효율적으로 관리할 수 있습니다. 주요 기능으로는:\n\n🎯 **워크스페이스**: 프로젝트별 공간 생성 및 관리\n👥 **팀 관리**: 팀원 구성 및 역할 분배\n✅ **작업 관리**: 할 일 생성 및 진행 상황 추적\n📝 **활동 로그**: 팀 활동 기록 및 공유\n👤 **프로필**: 개인 정보 관리\n\nAI 챗봇을 통해 이 모든 기능을 자연어로 편리하게 사용할 수 있습니다!'
            };
        }

        // 감정 표현 패턴
        const emotionMatch = text.match(/^(힘들어|피곤해|괜찮아|좋아|신나|슬퍼|기뻐|화나|busy|tired|good|bad|happy|sad)$/i);
        if (emotionMatch) {
            const emotion = emotionMatch[0].toLowerCase();
            let response = '';
            
            if (/(?:힘들어|피곤해|tired|busy)/i.test(emotion)) {
                response = '휴식도 중요합니다. 제가 도와드릴 수 있는 일이 있다면 언제든지 말씀해주세요!';
            } else if (/(?:좋아|신나|기뻐|happy|good)/i.test(emotion)) {
                response = '좋으시다니 다행이네요! 오늘도 productive한 하루 보내시길 응원합니다!';
            } else if (/(?:슬퍼|화나|sad|bad)/i.test(emotion)) {
                response = '괜찮으실 거예요. 제가 도와드릴 수 있는 일이 있다면 언제든지 말씀해주세요.';
            } else {
                response = '감정을 공유해주셔서 감사합니다. 제가 도와드릴 수 있는 일이 있을까요?';
            }
            
            return {
                action: 'general_chat',
                parameters: {
                    type: 'emotion',
                    content: emotion
                },
                message: response
            };
        }

        // 칭찬 패턴
        const praiseMatch = text.match(/^(잘했어|최고|대단해|굿|good|great|awesome|nice)$/i);
        if (praiseMatch) {
            return {
                action: 'general_chat',
                parameters: {
                    type: 'praise'
                },
                message: '감사합니다! 더 좋은 서비스를 제공하기 위해 노력하겠습니다.'
            };
        }

        // 도움 요청 패턴
        const helpPatterns = [
            /^(도움|help|도와줘|도와줘요|도움말|설명서|가이드|사용법|어떻게\s+써|어떻게\s+해|뭐\s+어때)$/i,
            /^(도움\s+필요해|도움\s+주세요|help\s+me|help\s+please|i\s+need\s+help)$/i,
            /^(뭘\s+어떻게\s+해|어떻게\s+사용해|사용\s+방법|기능\s+설명)$/i
        ];
        
        for (const pattern of helpPatterns) {
            if (pattern.test(cleanText)) {
                return {
                    action: 'general_chat',
                    parameters: {
                        type: 'help'
                    },
                    message: getHelpMessage()
                };
            }
        }
        
        // 이해하지 못한 경우의 fallback 응답
        return {
            action: 'general_chat',
            parameters: {
                type: 'not_understood',
                content: text
            },
            message: getNotUnderstoodMessage(text)
        };
        
    } catch (error) {
        console.error('Fallback parsing 오류:', error);
        return {
            action: 'general_chat',
            parameters: {
                type: 'error',
                content: 'fallback_error'
            },
            message: '죄송합니다. 요청을 처리하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        };
    }
}

// 도움말 메시지 생성 함수
function getHelpMessage(): string {
    return `저는 TeamSphere AI 챗봇입니다! 다음과 같은 기능들을 도와드릴 수 있습니다:

🏢 **워크스페이스 관리**
- "[이름] 워크스페이스 만들어줘"
- "[이름] 워크스페이스 생성해줘"

👥 **팀 관리**
- "[이름] 팀 만들어줘"
- "[이름] 팀 생성해줘"

✅ **작업 관리**
- "[제목] 작업 추가해줘"
- "[제목] 작업 만들어줘"
- "[제목] 작업에 [댓글] 달아줘"

📝 **활동 로그**
- "[메시지] 활동 로그 기록해줘"
- "[워크스페이스]에 [메시지] 활동 로그로 남겨줘"

👤 **프로필 관리**
- "내 이름 [이름]으로 바꿔줘"
- "내 나이 [숫자]로 수정해줘"
- "내 이메일 [이메일]로 업데이트해줘"

📊 **정보 조회**
- "내 프로필 보여줘"
- "대시보드 보여줘"
- "활동 로그 보여줘"
- "내 팀 목록 보여줘"
- "내 워크스페이스 목록 보여줘"
- "팀 조회해줘"
- "워크스페이스 목록 알려줘"
- "[워크스페이스명] 워크스페이스 팀 목록 보여줘"
- "[워크스페이스명]의 팀 목록 알려줘"

⏰ **일반 정보**
- "지금 몇 시야?"
- "오늘 날짜 알려줘"
- "지금 날씨 어때?"

💬 **일반 대화**
- "안녕", "잘 가", "너는 뭐야?" 등

자연어로 편하게 말씀해주세요! 어떤 기능이 필요하신가요?`;
}

// 이해하지 못한 경우의 메시지 생성 함수
function getNotUnderstoodMessage(originalText: string): string {
    const messages = [
        `죄송합니다. "${originalText}"라는 말씀은 이해하지 못했습니다.`,
        `미안하지만 "${originalText}"라는 요청은 잘 이해가 가지 않네요.`,
        `"${originalText}"라는 말씀은 제가 처리하기 어려운 요청입니다.`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return `${randomMessage}

제가 도와드릴 수 있는 기능들을 알고 싶으시면 "도움" 또는 "help"라고 말씀해주세요!`;
}
