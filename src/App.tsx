/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MapPin,
  Users,
  Laptop,
  CheckCircle2,
  ExternalLink,
  ClipboardList,
  Inbox,
  User,
  Building2,
  Briefcase,
  Mail,
  PenTool,
  Cpu,
  Star,
  Trash2,
  Search,
  Download,
  Check,
  TrendingUp,
  Sliders,
  ChevronRight,
  BookOpen,
  Plus
} from 'lucide-react';
import { Applicant, TabType } from './types';
import SalesDashboard from './components/SalesDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('guide');


  // FormData State
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    email: '',
    motivation: '자발적 신청',
    taskToAutomate: '',
    aiToolUsageLevel: 3,
    automationInterest: 5,
    laptopAvailable: '가능' as '가능' | '불가',
  });

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyAgree, setPrivacyAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load applicants from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ax_applicants');
    if (saved) {
      try {
        setApplicants(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load applicants', e);
      }
    } else {
      // Seed default demo applicants to show on first load
      const defaultDemo: Applicant[] = [
        {
          id: '1',
          name: '김태균',
          department: '마케팅본부',
          position: '프로',
          email: 'tk.kim@lottegrs.com',
          motivation: '브랜드 SNS 피드 백데이터 분석 기법에 생기는 수많은 비효율을 AI 챗봇 및 요약 프롬프트로 해결해 업무 시간을 단축하고 싶습니다.',
          taskToAutomate: '경쟁사 주간 프로모션 피드 및 댓글 반응 일괄 크롤링 데이터 분석/보고서 자동 초안 작성',
          aiToolUsageLevel: 4,
          automationInterest: 5,
          laptopAvailable: '가능',
          appliedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
        },
        {
          id: '2',
          name: '이지현',
          department: '롯데리아 직영사업부',
          position: 'GL',
          email: 'jh.lee@lottegrs.com',
          motivation: '현장 QSR 서비스 매뉴얼이 매우 방대하여 신입 사원 배치 시 교육 소요 기간이 깁니다. LLM 챗봇을 통해 가볍게 질문하고 핵심 매뉴얼을 찾아주는 업무 보조기를 구상 중입니다.',
          taskToAutomate: '클로버 가이드 및 점포 서비스 긴급 체크리스트 데이터 임베딩 기반 Q&A 챗봇',
          aiToolUsageLevel: 2,
          automationInterest: 4,
          laptopAvailable: '가능',
          appliedAt: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ];
      setApplicants(defaultDemo);
      localStorage.setItem('ax_applicants', JSON.stringify(defaultDemo));
    }
  }, []);

  // Save applicants
  const saveApplicants = (updated: Applicant[]) => {
    setApplicants(updated);
    localStorage.setItem('ax_applicants', JSON.stringify(updated));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAgree) {
      alert('개인정보 수집 및 이용에 동의해야 신청이 가능합니다.');
      return;
    }

    setIsSubmitting(true);

    const newApplicant: Applicant = {
      id: Math.random().toString(36).substring(2, 9),
      name: formData.name,
      department: formData.department,
      position: formData.position,
      email: formData.email,
      motivation: formData.motivation,
      taskToAutomate: formData.taskToAutomate,
      aiToolUsageLevel: formData.aiToolUsageLevel,
      automationInterest: formData.automationInterest,
      laptopAvailable: formData.laptopAvailable,
      appliedAt: new Date().toISOString()
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbwjzW3eo-VAKL80gEHpGLMKtMKRJqWaVoLTikveTSTtlkLoXBQT7xIdGyWuO37PdoC_/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newApplicant)
      });
    } catch (error) {
      console.error('Failed to submit registration to Google Apps Script:', error);
    }

    const nextApplicants = [newApplicant, ...applicants];
    saveApplicants(nextApplicants);

    setSubmitSuccess(true);
    setIsSubmitting(false);

    // Reset Form
    setFormData({
      name: '',
      department: '',
      position: '',
      email: '',
      motivation: '자발적 신청',
      taskToAutomate: '',
      aiToolUsageLevel: 3,
      automationInterest: 5,
      laptopAvailable: '가능',
    });
    setPrivacyAgree(false);

    // Auto switch to success popup or auto reset notice
    setTimeout(() => {
      setSubmitSuccess(null);
      setActiveTab('admin'); // 바로 신청 현황 탭으로 이동해서 제출 데이터를 볼 수 있게 유도
    }, 2500);
  };

  const handleDeleteApplicant = (id: string) => {
    if (confirm('정말 이 신청 데이터를 삭제하시겠습니까?')) {
      const filtered = applicants.filter(a => a.id !== id);
      saveApplicants(filtered);
    }
  };

  const exportToCSV = () => {
    const headers = ['이름', '부서명', '사번/직책', '신청동기', '자동화희망업무', 'AI 도구 활용수준', '자동화 관심도', '노트북지참', '신청일자'];
    const rows = applicants.map(a => [
      a.name,
      a.department,
      a.position,
      `"${a.motivation.replace(/"/g, '""')}"`,
      `"${a.taskToAutomate.replace(/"/g, '""')}"`,
      a.aiToolUsageLevel,
      a.automationInterest,
      a.laptopAvailable,
      new Date(a.appliedAt).toLocaleString()
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AX_부스터_과정_신청자명단.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation
  const totalCount = applicants.length;
  const laptopOkCount = applicants.filter(a => a.laptopAvailable === '가능').length;
  const avgAiLevel = totalCount ? (applicants.reduce((sum, a) => sum + a.aiToolUsageLevel, 0) / totalCount).toFixed(1) : '0';
  const avgInterest = totalCount ? (applicants.reduce((sum, a) => sum + a.automationInterest, 0) / totalCount).toFixed(1) : '0';

  // Filtered list
  const filteredApplicants = applicants.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      a.department.toLowerCase().includes(term) ||
      a.position.toLowerCase().includes(term) ||
      (a.email && a.email.toLowerCase().includes(term)) ||
      a.motivation.toLowerCase().includes(term) ||
      a.taskToAutomate.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-geo-bg text-geo-dark selection:bg-geo-blue/10 selection:text-geo-blue">
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-geo-border transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 cursor-pointer" onClick={() => setActiveTab('guide')}>
            <div className="text-[15px] font-bold tracking-tighter uppercase text-[#ED1C24]">
              LOTTE GRS ACADEMY
            </div>
          </div>

          {/* PAGE TAB NAVIGATION */}
          <nav className="flex items-center gap-6 sm:gap-8 text-xs font-semibold tracking-widest uppercase">
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-1 transition-all duration-200 border-b-2 text-[11px] ${
                activeTab === 'guide'
                  ? 'text-geo-dark border-geo-dark font-extrabold'
                  : 'text-geo-gray border-transparent hover:text-geo-dark'
              }`}
            >
              GUIDE / 교육 안내
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`pb-1 transition-all duration-200 border-b-2 text-[11px] ${
                activeTab === 'apply'
                  ? 'text-geo-dark border-geo-dark font-extrabold'
                  : 'text-geo-gray border-transparent hover:text-geo-dark'
              }`}
            >
              APPLY / 교육 신청
            </button>
             <button
              onClick={() => {
                setActiveTab('admin');
              }}
              className={`pb-1 transition-all duration-200 border-b-2 text-[11px] ${
                activeTab === 'admin'
                  ? 'text-geo-dark border-geo-dark font-extrabold'
                  : 'text-geo-gray border-transparent hover:text-geo-dark'
              }`}
            >
              EXAMPLE / 작업 결과물 예시
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main className="flex-1">
        {activeTab === 'guide' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-white pt-16 pb-20 border-b border-geo-border">
              {/* Dot Grid Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none geo-dot-grid" />

              <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7 space-y-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-geo-border">
                      <div className="w-2.5 h-2.5 rounded-full bg-geo-blue shrink-0" />
                      <span className="text-[10px] font-mono tracking-widest uppercase text-geo-dark">
                        PHASE 01 / 실행 중심 프로젝트형 AX 교육 캠프
                      </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-geo-dark">
                      AX 부스터 과정
                      <span className="block text-2xl font-bold font-sans text-geo-blue mt-4 leading-relaxed">
                        AI를 실제 실무 성과로 작동 시키는 3일 교육 과정
                      </span>
                    </h1>

                    <p className="text-sm text-geo-gray-dark leading-relaxed max-w-xl">
                      &quot;아는 AI&quot;에서 <strong className="text-geo-dark font-bold">&quot;활용하는 AI&quot;</strong>로의 실질적 전환! <br className="hidden sm:inline" />
                      현업 중심의 AI 자동화 기술과 비즈니스 생산성 혁신 앱을 3일간 직접 조립하고 실물로 구현합니다.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setActiveTab('apply')}
                        className="h-12 px-6 bg-geo-dark text-white font-mono text-[11px] tracking-widest uppercase hover:bg-white hover:text-geo-dark border border-geo-dark transition-all duration-200 text-center flex items-center justify-center cursor-pointer"
                      >
                        참가 신청서 제출하기 →
                      </button>
                      <button
                        onClick={() => {
                          const el = document.getElementById('curriculum-sec');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="h-12 px-6 bg-white text-geo-gray-dark font-mono text-[11px] tracking-widest uppercase hover:border-geo-dark hover:text-geo-dark border border-geo-border transition-all duration-200 text-center flex items-center justify-center cursor-pointer"
                      >
                        커리큘럼 살펴보기 ↓
                      </button>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <span className="px-3.5 py-2 bg-white border border-geo-dark text-geo-dark text-[11px] font-bold font-sans tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#ED1C24]">
                        <Calendar className="w-4 h-4 text-[#ED1C24]" />
                        '26.07.20(월) ~ '26.07.22(수)
                      </span>
                      <span className="px-3.5 py-2 bg-white border border-geo-dark text-geo-dark text-[11px] font-bold font-sans tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#ED1C24]">
                        <MapPin className="w-4 h-4 text-[#ED1C24]" />
                        LOTTE GRS ACADEMY
                      </span>
                      <span className="px-3.5 py-2 bg-white border border-geo-dark text-geo-dark text-[11px] font-bold font-sans tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#ED1C24]">
                        <Users className="w-4 h-4 text-[#ED1C24]" />
                        GL PRO (MAX 20 MEMBERS)
                      </span>
                    </div>
                  </div>
 
                  {/* HERO RIGHT SIDE INFO CONTAINER */}
                  <div className="lg:col-span-5">
                    <div className="bg-white border border-geo-border p-6 sm:p-8 relative">
                      
                      <div className="pb-6 mb-6 border-b border-geo-border">
                        <p className="text-[10px] font-mono tracking-widest text-geo-gray-light uppercase">CURRENT REVISION</p>
                        <h3 className="text-xl font-bold tracking-tight text-geo-dark mt-1">AX 부스터 과정 안내</h3>
                        <p className="text-xs text-geo-gray-dark mt-1">업무를 AI로 전환하기 위한 20명 한정 과정</p>
                      </div>
 
                      <div className="space-y-4">
                        {[
                          { label: '장소', value: '롯데GRS 아카데미' },
                          { label: '대상 및 정원', value: 'GL 및 프로 (20명)' },
                          { label: '교육 일정', value: "'26.07.20(월) ~ '26.07.22(수)" },
                          { label: '준비 사항', value: '개인 노트북 및 사전 실무 로우 데이터 파일' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-baseline gap-4 border-b border-geo-border/30 pb-2 last:border-b-0 last:pb-0">
                            <span className="text-[9px] font-mono text-geo-gray uppercase tracking-wider shrink-0">{item.label}</span>
                            <span className="text-xs font-bold text-geo-dark text-right leading-tight">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CORE MODULES / CARD COLUMNS */}
            <section className="py-20 bg-white">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center mb-16 space-y-2">
                  <p className="text-[10px] font-mono tracking-widest text-geo-blue uppercase">RECOMMENDED TARGETS</p>
                  <h2 className="text-3xl font-bold text-geo-dark tracking-tight uppercase">이런 분들께 적극 권장합니다</h2>
                  <p className="text-geo-gray text-xs leading-relaxed max-w-xl mx-auto">
                    단순 교육이 아닌, 개인 또는 부서 업무 특성에 맞춘 비즈니스 프롬프트, 챗봇, 대시보드 구조화 전 과정을 제작하는 교육 과정입니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      num: '01 / AUTOMATION',
                      title: '사무 생산성 10배 부스터',
                      desc: '매주 반복되는 정기 보고서, 시장 리서치, 다국어 트렌드 등 번거롭고 많은 시간이 걸리는 업무 자동화 수프 완성',
                    },
                    {
                      num: '02 / DIALOGUE',
                      title: '나만의 업무용 맞춤 챗봇',
                      desc: 'Aimember 및 내부 API를 융합하거나 사내 매뉴얼, 가이드를 학습시켜 나만의 일잘러 비서 챗봇 빌딩',
                    },
                    {
                      num: '03 / ANALYTICS',
                      title: '실감나는 대시보드 시각화',
                      desc: '구글 AI 스튜디오 및 클라우드를 연계해 복잡한 원시 로우 데이터를 단번에 깔끔한 비주얼 대시보드로 시뮬레이션',
                    },
                    {
                      num: '04 / MENTORING',
                      title: '전문가 실시간 기술 코칭',
                      desc: '3일차 메인 해커톤 단계에서 도메인 전문 강사와 개발진이 배치되어, 아이디어를 실제 프로토타입으로 완성 지원',
                    },
                  ].map((x, idx) => (
                    <div
                      key={idx}
                      className="border-t border-geo-border pt-6 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="text-[10px] font-mono mb-4 text-geo-gray-light">{x.num}</div>
                        <h4 className="font-bold text-sm text-geo-dark tracking-tight uppercase mb-2 group-hover:text-geo-blue transition-colors duration-200">{x.title}</h4>
                        <p className="text-xs text-geo-gray-dark leading-relaxed">{x.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CURRICULUM SECTION */}
            <section id="curriculum-sec" className="py-20 bg-[#F8F8F7] border-t border-b border-geo-border">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center mb-16 space-y-2">
                  <p className="text-[10px] font-mono tracking-widest text-geo-blue uppercase">DETAILED MILESTONES</p>
                  <h2 className="text-3xl font-bold text-geo-dark tracking-tight uppercase">커리큘럼</h2>
                  <p className="text-geo-gray text-xs leading-relaxed max-w-xl mx-auto">
                    현업 맞춤형 커스텀 챗봇부터 자동화 피드 대시보드, 그리고 대망의 끝장 해커톤까지 완벽한 단계적 역량 부스팅
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Day 1 */}
                  <div className="bg-white border border-geo-border flex flex-col rounded-none shadow-sm">
                    <div className="p-6 bg-geo-dark text-white space-y-4">
                      <span className="inline-block px-2 py-0.5 border border-white/20 text-white font-mono text-[9px] tracking-widest uppercase">
                        DAY 01 / INFRASTRUCTURE
                      </span>
                      <div>
                        <h3 className="text-sm font-bold tracking-widest uppercase">나만의 AI 커스텀 챗봇</h3>
                        <p className="text-[10px] text-white/70 font-medium mt-1">AI 융합 기초 모델 활용 및 챗봇 제작</p>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8 flex-1 space-y-6">
                      {[
                        { title: 'Generative AI 오리엔테이션', info: '프롬프팅 기초 전략 및 주의점', time: '1시간' },
                        { title: '시장조사 & 트렌드 리서치 기법', info: '심화 리서치 기법 및 시간 단축 에이전트', time: '1시간' },
                        { title: '비즈니스 보고서 초안 생성 기법', info: '기획서, 보고서 유형별 맞춤 프롬프트', time: '1시간' },
                        { title: '데이터 분석 기초 및 테이블 도큐먼팅', info: '데이터 요약 및 구조화 분석 실습', time: '1시간' },
                        { title: '실무 커스텀 AI 챗봇 실전 제작', info: '실무 매뉴얼 챗봇 직접 디자인 및 테스트', time: '2시간' },
                      ].map((s, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4 border-b border-geo-bg pb-4 last:border-b-0 last:pb-0">
                          <div>
                            <p className="font-bold text-xs text-geo-dark">{s.title}</p>
                            <p className="text-[10px] text-geo-gray font-medium mt-0.5">{s.info}</p>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-geo-bg border border-geo-border text-geo-gray shrink-0">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day 2 */}
                  <div className="bg-white border border-geo-border flex flex-col rounded-none shadow-sm">
                    <div className="p-6 bg-geo-gray-dark text-white space-y-4">
                      <span className="inline-block px-2 py-0.5 border border-white/20 text-white font-mono text-[9px] tracking-widest uppercase">
                        DAY 02 / MULTIDIMENSIONAL
                      </span>
                      <div>
                        <h3 className="text-sm font-bold tracking-widest uppercase">대시보드 설계 및 다차원 분석</h3>
                        <p className="text-[10px] text-white/70 font-medium mt-1">문제 정의, 아이디에이션, 구조 디자인</p>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8 flex-1 space-y-6">
                      {[
                        { title: 'RICE 프롬프팅 메커니즘', info: '도달, 영향, 확실성, 노력을 통한 문제 점검', time: '1시간' },
                        { title: 'AI 리서치를 통한 과제 구체화', info: '자동화할 프로세스의 핵심 구조 설계', time: '1시간' },
                        { title: '아이디어 브레인스토밍 고도화', info: 'LLM 비서를 활용한 개선 방안 및 로드맵', time: '1시간' },
                        { title: '데이터 차트 분석 및 프로토타입 작성', info: '기초 시각화 설계 방법론 습득', time: '1시간' },
                        { title: '맞춤형 대시보드 피드 실습 구축', info: '데이터를 입력받아 요약 피드 대시보드 빌딩', time: '2시간' },
                      ].map((s, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4 border-b border-geo-bg pb-4 last:border-b-0 last:pb-0">
                          <div>
                            <p className="font-bold text-xs text-geo-dark">{s.title}</p>
                            <p className="text-[10px] text-geo-gray font-medium mt-0.5">{s.info}</p>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-geo-bg border border-geo-border text-geo-gray shrink-0">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day 3 */}
                  <div className="bg-white border border-geo-border flex flex-col rounded-none shadow-sm">
                    <div className="p-6 bg-geo-blue text-white space-y-4">
                      <span className="inline-block px-2 py-0.5 border border-white/20 text-white font-mono text-[9px] tracking-widest uppercase">
                        DAY 03 / PRODUCTION
                      </span>
                      <div>
                        <h3 className="text-sm font-bold tracking-widest uppercase">끝장 해커톤 &amp; 어워드</h3>
                        <p className="text-[10px] text-white/70 font-medium mt-1">아이디어를 현실로 구현 및 발표, 심사</p>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8 flex-1 space-y-6">
                      {[
                        { title: '과제 집중 개발 세션 I', info: '전문 강사 및 개발팀 밀착 코칭 및 기능 조율', time: '3시간' },
                        { title: '과제 집중 개발 세션 II', info: 'UX UI 보정, 예외 처리 및 최종 동작 다듬기', time: '3시간' },
                        { title: '결과 공유 및 발표식', info: '팀별 완성품 시찰 및 현업 아이디어 피칭', time: '2시간' },
                        { title: '종합 피드백 및 우수 사례 시상', info: '종합 평가 및 우수상 수여', time: 'Final' },
                      ].map((s, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4 border-b border-geo-bg pb-4 last:border-b-0 last:pb-0">
                          <div>
                            <p className="font-bold text-xs text-geo-dark">{s.title}</p>
                            <p className="text-[10px] text-geo-gray font-medium mt-0.5">{s.info}</p>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-geo-bg border border-geo-border text-geo-gray shrink-0">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>



          </motion.div>
        )}

        {/* =======================================
            TAB: APPLY FORM
           ======================================= */}
        {activeTab === 'apply' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="py-16 bg-[#F8F8F7]"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10 space-y-2">
                <span className="inline-block text-[9px] font-mono bg-white border border-geo-border text-geo-gray px-3 py-1 rounded-none uppercase tracking-wider">
                  Digital transformation / ADMISSION
                </span>
                <h1 className="text-3xl font-bold text-geo-dark tracking-tight uppercase font-sans">AX 부스터 과정 교육 신청</h1>
                <p className="text-geo-gray text-xs leading-relaxed max-w-md mx-auto">
                  현업 과제 기반으로 알찬 실습 결과를 도출하기 위해, 꼼꼼하고 알찬 작성을 장려합니다.
                </p>
              </div>

              {/* MAIN FORM CARD */}
              <div className="bg-white border border-geo-border shadow-sm rounded-none overflow-hidden">
                <div className="px-6 py-8 sm:px-10 bg-geo-dark text-white relative">
                  <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-white/10 flex items-center justify-center font-mono text-[10px] text-white/30 uppercase tracking-widest">
                    FORM.01
                  </div>
                  <h3 className="text-base sm:text-lg font-bold tracking-widest uppercase">AX 부스터 과정 교육 신청</h3>
                  <p className="text-[10px] text-white/70 font-mono mt-1">
                    '26.07.20(월) ~ '26.07.22(수) | LOTTE GRS ACADEMY
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 sm:p-10 space-y-8">
                  {/* SECTION 1: PERSONAL INFORMATION */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-geo-border pb-2.5">
                      <div className="text-geo-blue shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-[10px] font-mono text-geo-dark uppercase tracking-widest">개인 정보 PERSONAL DATA</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono tracking-wider uppercase text-geo-gray flex items-center gap-1">
                          성명 NAME <span className="text-geo-blue font-bold font-mono">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="예: 홍길동"
                          className="w-full h-10 px-3 border border-geo-border bg-[#F8F8F7] text-xs font-semibold focus:bg-white focus:border-geo-dark transition-all outline-none rounded-none focus:ring-0"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono tracking-wider uppercase text-geo-gray flex items-center gap-1">
                          소속 부서 DEPT <span className="text-geo-blue font-bold font-mono">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          required
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="예: 000팀"
                          className="w-full h-10 px-3 border border-geo-border bg-[#F8F8F7] text-xs font-semibold focus:bg-white focus:border-geo-dark transition-all outline-none rounded-none focus:ring-0"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-sans tracking-wider uppercase text-geo-gray flex items-center gap-1">
                          사번 / Employee number <span className="text-geo-blue font-bold font-mono">*</span>
                        </label>
                        <input
                          type="text"
                          name="position"
                          required
                          value={formData.position}
                          onChange={handleInputChange}
                          placeholder="예: 123456"
                          className="w-full h-10 px-3 border border-geo-border bg-[#F8F8F7] text-xs font-semibold focus:bg-white focus:border-geo-dark transition-all outline-none rounded-none focus:ring-0"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-sans tracking-wider uppercase text-geo-gray flex items-center gap-1">
                          신청 동기 MOTIVATION <span className="text-geo-blue font-bold font-mono">*</span>
                        </label>
                        <select
                          name="motivation"
                          required
                          value={formData.motivation}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 border border-geo-border bg-[#F8F8F7] text-xs font-semibold focus:bg-white focus:border-geo-dark transition-all outline-none rounded-none focus:ring-0 cursor-pointer"
                        >
                          <option value="자발적 신청">자발적 신청</option>
                          <option value="부서장 추천">부서장 추천</option>
                          <option value="동료 추천">동료 추천</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: LEVEL ESTIMATION */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-geo-border pb-2.5">
                      <div className="text-geo-blue shrink-0">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-[10px] font-mono text-geo-dark uppercase tracking-widest">사전 기량 자가 체크 SELF DIAGNOSIS</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* AI usage level selection */}
                      <div className="bg-[#F8F8F7] p-5 border border-geo-border rounded-none space-y-3.5">
                        <div>
                          <p className="text-xs font-bold text-geo-dark">1. 본인의 평소 Generative AI 빈도 및 숙련도 <span className="text-geo-blue font-bold font-mono">*</span></p>
                          <p className="text-[10px] text-geo-gray font-medium">생성형 AI 실무 사용 습관</p>
                        </div>
                        <div className="flex justify-between gap-1 bg-white p-1 border border-geo-border rounded-none">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => handleRadioChange('aiToolUsageLevel', lvl)}
                              className={`flex-1 py-1.5 rounded-none text-xs font-mono font-bold transition-all ${
                                formData.aiToolUsageLevel === lvl
                                  ? 'bg-geo-dark text-white'
                                  : 'text-geo-gray hover:text-geo-dark hover:bg-geo-bg'
                              }`}
                            >
                              {lvl}
                              <span className="block text-[8px] opacity-70 font-sans font-medium">
                                {lvl === 1 ? '입문' : lvl === 5 ? '신급' : ''}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Automation Interest */}
                      <div className="bg-[#F8F8F7] p-5 border border-geo-border rounded-none space-y-3.5">
                        <div>
                          <p className="text-xs font-bold text-geo-dark">2. 사내 업무 자동화에 대한 열의와 관심 <span className="text-geo-blue font-bold font-mono">*</span></p>
                          <p className="text-[10px] text-geo-gray font-medium">배우고자 하시는 도전 의지 및 의욕 점수</p>
                        </div>
                        <div className="flex justify-between gap-1 bg-white p-1 border border-geo-border rounded-none">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => handleRadioChange('automationInterest', lvl)}
                              className={`flex-1 py-1.5 rounded-none text-xs font-mono font-bold transition-all ${
                                formData.automationInterest === lvl
                                  ? 'bg-geo-dark text-white'
                                  : 'text-geo-gray hover:text-geo-dark hover:bg-geo-bg'
                              }`}
                            >
                              {lvl}
                              <span className="block text-[8px] opacity-70 font-sans font-medium">
                                {lvl === 1 ? '낮음' : lvl === 5 ? '최고' : ''}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: HARDWARE AND COMPLIANCE */}
                  <div className="space-y-4">
                    <div className="p-4 border border-geo-border bg-[#F8F8F7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-none">
                      <div>
                        <p className="text-xs font-bold text-geo-dark flex items-center gap-1">
                          <Laptop className="w-4 h-4 text-geo-blue shrink-0" />
                          개인 업무식 모바일 노트북 지참 여부 확인 <span className="text-geo-blue font-bold font-mono">*</span>
                        </p>
                        <p className="text-[10px] text-geo-gray mt-0.5">
                          대면 집중 실습 중심의 트랙이므로 업무 망에 정식 등록된 지참 노트북은 수강 필수 요소입니다.
                        </p>
                      </div>
                      <div className="flex gap-1 bg-white p-1 border border-geo-border shrink-0 rounded-none">
                        {['가능', '불가'].map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => handleRadioChange('laptopAvailable', opt as '가능' | '불가')}
                            className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all ${
                              formData.laptopAvailable === opt
                                ? 'bg-geo-dark text-white'
                                : 'text-geo-gray hover:text-geo-dark hover:bg-geo-bg'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PRIVACY CHECK */}
                    <div className="p-4 border border-geo-border bg-white rounded-none space-y-3">
                      <p className="text-[10px] text-geo-gray-light font-medium leading-relaxed">
                        수집 목적: 롯데GRS 아카데미 전문 &apos;AX 부스터 과정&apos; 참가 승인 내역 확인, 이메일을 통한 전처리 예습 가이드 배포 및 당일 사내 해커톤 수상 연락 수렴. 보존 기한: 금번 수료 완료 시점 및 사후 피드 회수 60여일 이후 완전 폐기 처리함.
                      </p>
                      <label className="flex items-center gap-2.5 cursor-pointer selection:bg-transparent">
                        <input
                          type="checkbox"
                          checked={privacyAgree}
                          onChange={(e) => setPrivacyAgree(e.target.checked)}
                          className="w-4 h-4 accent-geo-blue rounded-none border-geo-border focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-geo-dark">
                          위의 개인정보 수집 및 운영 목적에 동의합니다. <span className="text-geo-blue font-bold font-mono">*</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON WITH NOTICE POPUP */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-geo-dark text-white font-mono text-[11px] tracking-widest uppercase hover:bg-white hover:text-geo-dark border border-geo-dark transition-all rounded-none cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '제출 중...' : '제출하기'}
                    </button>

                    {/* Alert Toast feedback */}
                    <AnimatePresence>
                      {submitSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-4 p-4 rounded-none bg-emerald-50 border border-emerald-600 text-emerald-800 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <p className="text-xs font-bold">
                            참가 지원서가 정상적으로 등록되었으며, 신청 현황 리스트에 반영되었습니다! 🎉
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* =======================================
            TAB: ADMIN DASHBOARD
           ======================================= */}
        {activeTab === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="py-12 bg-[#F8F8F7]"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <SalesDashboard />
            </div>
          </motion.div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-geo-dark border-t border-geo-border py-6 text-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
              <span className="font-bold text-xs tracking-wider text-white uppercase">AX 부스터 과정</span>
              <span className="text-[9px] px-1.5 py-0.5 border border-white/20 text-white rounded-none uppercase">
                LOTTE GRS ACADEMY 교육 안내문
              </span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed max-w-sm">
              문의사항 : 롯데GRS 인재육성팀 박승국 프로 02-709-1067
            </p>
          </div>

          <div className="text-center md:text-right space-y-2 flex flex-col items-center md:items-end justify-start">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/30">
              © 2026 LOTTE GRS ACADEMY. All rights reserved.
            </p>
            <p className="text-[11px] text-white/50">
              AX 부스터 과정
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-1 h-8 px-3.5 bg-[#1C1C1C] border border-white/20 text-white font-mono text-[10px] tracking-widest uppercase hover:bg-white hover:text-geo-dark transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
            >
              TOP ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
