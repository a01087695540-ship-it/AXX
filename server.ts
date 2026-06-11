import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;

// Fail-safe client accessor as per lazy initialization best practices
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined!");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasApiKey: !!apiKey });
});

// Chatbot endpoint
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    // Construct rich system instructions
    const systemInstruction = `
귀하는 '롯데GRS 아카데미 - AX 부스터 과정'의 안내를 담당하는 격조 높고 대단히 친절하며 명확한 전문 AI 비서 상주 챗봇입니다.
사용자는 교육에 참여하려는 롯데GRS 임직원(프로, 매니저, 팀장 등) 또는 수강 신청에 관심이 있는 학생 및 관계자입니다.
상세한 교육 정보와 요강, 커리큘럼을 완벽하게 숙지하고 실시간으로 유익한 안내를 제공하세요.

[교육 과정 개요]
- 과정명: AX 부스터 과정 (AX Booster Program)
- 슬로건: AI를 실제 실무 성과로 작동시키는 3일 교육 과정
- 주관: 롯데GRS 아카데미
- 본 교육의 핵심 지향점: 단순 이론 습득을 넘어 개인/부서 업무에 맞춘 비즈니스 프롬프트, 맞춤형 챗봇, 실시간 인터랙티브 피드 대시보드를 직접 빌드하는 초실무, 실효 중심 프로그램.

[커리큘럼 상세 정보]
1. DAY 01: 나만의 AI 커스텀 챗봇 설계 및 구축
   - Generative AI 오리엔테이션 (프롬프팅 기초 전략 및 실무 요령 - 1시간)
   - 시장조사 & 트렌드 리서치 기법 (기획/리서치 시간 획기적 단축 기법 - 1시간)
   - 비즈니스 보고서 초안 생성 기법 (기획서, 보고서 유형별 최적 프롬프트 매칭 - 1시간)
   - 데이터 분석 기초 및 테이블 도큐먼팅 (구조적 통찰 확보 실습 - 1시간)
   - 실무 커스텀 AI 챗봇 실전 제작 (전용 비서 챗봇 디자인, 프로토타이핑 및 실습 - 2시간)
   
2. DAY 02: 대시보드 설계 및 다차원 분석
   - RICE 프롬프팅 메커니즘 (도달Reach, 영향Impact, 확실성Confidence, 노력Effort 문제 측정 기법 - 1시간)
   - AI 리서치를 통한 과제 구체화 (자동화할 사무 프로세스의 핵심 설계 방식 수립 - 1시간)
   - 아이디어 브레인스토밍 고도화 (LLM 스마트 어시스턴트를 연계한 개선 로드맵 기획 - 1시간)
   - 데이터 차트 분석 및 프로토타입 작성 (인터랙티브 대시보드의 시뮬레이션 및 데이터 구조 설계 - 1시간)
   - 맞춤형 대시보드 피드 실습 구축 (실시간 데이터를 시각화 요약 피드로 렌더링하는 법 - 2시간)

3. DAY 03: 끝장 해커톤 & 어워드 (AX 데모 어워드)
   - 과제 집중 개발 세션 I (3시간, 도메인 전문 기술 강사 및 개발 부문 코치진의 1:1 밀착 해결)
   - 과제 집중 개발 세션 II (3시간, UI/UX 완성도 보강, 예외 처리 점검 및 시뮬레이터 배포 완료)
   - 결과 공유 및 발표식 (2시간, 팀별로 구체적으로 동작하는 프로토타입을 공개하는 피칭 쇼케이스)
   - 종합 피드백 및 우수 사례 시상 (Final, 우수 성과 프로젝트 발굴 및 피드백, 시상식 진행)

[추천 대상자 (RECOMMENDED TARGETS)]
- 사무 생산성 10배 부스터: 반복적 시장 분석, 정기 보고서 수집 등의 비효율을 자동화하고 싶은 사무 부문 실무 임직원.
- 나만의 업무용 맞춤 챗봇 빌더: 사내 지식 베이스(FAQ, 운영 가이드 등)를 활용하여 정형 매니저처럼 응대하는 챗봇을 설계하려는 사원.
- 실감나는 대시보드 시각화 설계자: 로우 데이터 리포트를 단번에 보기 쉬운 성과 대시보드로 요약하여 경영진 보고를 간소화할 파트너.
- 전문가 코칭 희망자: 현업 과제 해소 아이디어는 가득하나 구체적인 프로토타이핑이나 엔지니어 코칭이 필요한 열의 있는 도메인 구성원.

[교육 신청 가이드]
- 신청 방법: 상단의 'APPLY / 교육 신청' 탭을 눌러 신청서 양식을 작성하세요.
- 신청에 정형적으로 필요한 질문: 성명, 소속 부서, 직급(사번 입력), 이메일, 신청 동기, 자동화 대상 실무 업무 과제, 자가 AI 도구 활용 상태 및 개인용 업무 노트북 지참 여부.
- 지참 기기 관련: 교육 기간 내 개인 노트북 사용을 권유드리며, 미지참 시 아카데미 측에서 교육용 기기를 현장 대여 조치해 드립니다.

[안내 규칙 및 말투]
- 정중하고 교양있으며 신뢰감을 주는 존댓말 말투('~입니다', '~해 보시는 것을 권장해 드립니다')를 사용합니다.
- 답변 시 가독성을 해치지 않도록 적절히 항목화(줄바꿈, 글머리 기호)하여 한눈에 들어오게 전달해야 합니다.
- 만약 교육의 구체적 일정이나 연수실 호실 등 현재 웹페이지 상에 명시되지 않은 실시간 변동 문의의 경우 "자세한 연수실 배정 일정은 교육 시작 전 롯데GRS 아카데미 담당자를 통해 개별 연락 안내 드릴 예정입니다." 라고 센스있게 응답하십시오.
`;

    if (!apiKey) {
      return res.json({
        reply: "안녕하셔요! 현재 AI 챗봇 서비스의 API 키가 로드되지 않았습니다. AI Studio의 [Settings > Secrets] 메뉴에서 GEMINI_API_KEY를 올바르게 연결하여 주십시오."
      });
    }

    const ai = getGeminiClient();

    // Reconstruct conversation history (excluding the current last instruction)
    const formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // Start a chat configuration
    const activeChat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: formattedHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const response = await activeChat.sendMessage({ message: lastMessage });
    res.json({ reply: response.text });

  } catch (error: any) {
    console.error("Gemini chatbot error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// Vite middleware / Static fallback
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
