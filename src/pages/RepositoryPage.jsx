import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { AlertCircle, ArrowLeft, ExternalLink, Github, Star, GitFork, Clock, Info, Shield, FileText, Trash2 } from 'lucide-react';
import { NotificationContext } from '../contexts/notificationContext';
import languageUtils from '../utils/languageUtils';
import chatbotService from '../services/chatbotService';
import DashboardLayout from '../components/dashboard-layout';
import repositoryService from '../services/repositoryService';

const GUIDE_MESSAGE = {
  senderType: 'Agent',
  content: `안녕하세요! 저장소에 대해 어떤 것이든 물어보세요. 컨트리뷰션 방법, 코딩 컨벤션, PR 작성 방법 등에 대해 답변해 드릴 수 있습니다.`,
};

export default function RepositoryPage() {
  const { isConnected } = useContext(NotificationContext);
  const { id: repoId } = useParams();
  const accessToken = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('repoActiveTab') || 'overview');

  // 챗봇 상태
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatError, setChatError] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const chatEndRef = useRef(null);

  // 저장소 정보 가져오기
  useEffect(() => {
    console.log(`알림 연결 상태: ${isConnected ? '연결됨' : '끊김'}`);
    const loadRepositoryData = async () => {
      if (!repoId) {
        setError('저장소 ID가 필요합니다.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await repositoryService.getRepositoryDetails(repoId);

        if (result.success) {
          setRepo(result.data);
          setError(null);
        } else {
          setError(result.message || '저장소 정보를 불러올 수 없습니다.');
        }
      } catch {
        setError('저장소 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadRepositoryData();
  }, [repoId, isConnected]);

  // 챗봇탭 클릭 시: conversation 조회만 시도(없으면 생성X)
  useEffect(() => {
    if (
      activeTab === 'chatbot' &&
      repo &&
      userId &&
      accessToken
    ) {
      const fetchConversation = async () => {
        setChatLoading(true);
        setChatError('');
        try {
          const result = await chatbotService.getConversation({ repoId, userId, accessToken });
          if (result.success) {
            setConversationId(result.conversationId);
            setChatMessages(result.messages || []);
          } else if (result.status === 401) {
            window.location.replace('/login');
          } else {
            setChatError(result.message || '챗봇 대화 조회에 실패했습니다.');
          }
        } catch {
          setChatError('챗봇 대화 조회 중 오류가 발생했습니다.');
        }
        setChatLoading(false);
      };
      fetchConversation();
    }
  }, [activeTab, repo, userId, accessToken, repoId]);

  // 메시지 전송 시: 대화가 없으면 먼저 생성, 그 후 메시지 저장
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);

    let conversationIdForSend = conversationId;

    if (!conversationIdForSend) {
      // 대화가 없으면 생성
      try {
        const createResult = await chatbotService.createConversation({ repoId, userId, accessToken });
        if (createResult.success) {
          conversationIdForSend = createResult.conversationId;
          setConversationId(conversationIdForSend);
          // 새로 만든 conversation의 메시지 목록을 불러옴 (대부분 빈 배열이지만, 혹시라도 있을 수 있음)
          const fetchResult = await chatbotService.getConversation({ repoId, userId, accessToken });
          if (fetchResult.success) {
            setChatMessages(fetchResult.messages || []);
          } else {
            setChatMessages([]);
          }
        } else {
          setChatError('챗봇 대화 생성에 실패했습니다.');
          setChatLoading(false);
          return;
        }
      } catch {
        setChatError('챗봇 대화 생성 중 오류가 발생했습니다.');
        setChatLoading(false);
        return;
      }
    }

    // 메시지 전송
    const tempId = Date.now() + Math.random();
    const newMsg = { senderType: 'User', content: chatInput.trim(), tempId };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    try {
      await chatbotService.saveChatMessage({
        conversationId: conversationIdForSend,
        senderType: 'User',
        content: newMsg.content,
        accessToken,
      });
    } catch {
      setChatMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      setChatError('메시지 전송에 실패했습니다. 다시 시도해 주세요.');
    }
    setChatLoading(false);
  };

  // 엔터키 처리
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지 추가 시 스크롤 아래로
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // 라이선스 정보 및 의무사항
  const licenseInfo = {
    MIT: {
      fullName: 'MIT License',
      description: '간단하고 관대한 라이선스로, 저작권 및 라이선스 고지만 필요합니다.',
      permissions: ['상업적 사용', '수정', '배포', '개인 사용'],
      conditions: ['라이선스 및 저작권 고지 포함'],
      limitations: ['책임 면제', '보증 없음'],
      color: 'blue',
    },
    'Apache-2.0': {
      fullName: 'Apache License 2.0',
      description: '특허권 부여와 함께 사용자에게 자유를 제공하는 라이선스입니다.',
      permissions: ['상업적 사용', '수정', '배포', '특허권 사용', '개인 사용'],
      conditions: ['라이선스 및 저작권 고지 포함', '상태 변경 명시'],
      limitations: ['상표권 사용 금지', '책임 면제', '보증 없음'],
      color: 'orange',
    },
    'GPL-3.0': {
      fullName: 'GNU General Public License v3.0',
      description: '수정된 코드를 동일한 라이선스로 공개해야 하는 강력한 카피레프트 라이선스입니다.',
      permissions: ['상업적 사용', '수정', '배포', '특허권 사용', '개인 사용'],
      conditions: [
        '소스 코드 공개',
        '라이선스 및 저작권 고지 포함',
        '동일한 라이선스 사용',
        '상태 변경 명시',
      ],
      limitations: ['책임 면제', '보증 없음'],
      color: 'green',
    },
    'BSD-3-Clause': {
      fullName: 'BSD 3-Clause License',
      description: '간단하고 관대한 라이선스로, 저작권 고지와 면책 조항이 필요합니다.',
      permissions: ['상업적 사용', '수정', '배포', '개인 사용'],
      conditions: ['라이선스 및 저작권 고지 포함'],
      limitations: ['책임 면제', '보증 없음'],
      color: 'blue',
    },
    ISC: {
      fullName: 'ISC License',
      description: 'MIT와 유사한 간단하고 관대한 라이선스입니다.',
      permissions: ['상업적 사용', '수정', '배포', '개인 사용'],
      conditions: ['라이선스 및 저작권 고지 포함'],
      limitations: ['책임 면제', '보증 없음'],
      color: 'blue',
    },
  };

  // 로딩 상태
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              저장소 정보를 로드하는 중...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 오류 상태
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-red-600">오류가 발생했습니다</div>
          <div className="text-sm text-gray-600">{error}</div>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </DashboardLayout>
    );
  }

  // 저장소 데이터가 없는 경우
  if (!repo) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg">저장소를 찾을 수 없습니다</div>
          <Button asChild>
            <Link to="/dashboard">대시보드로 돌아가기</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // 기본 라이선스 정보 (라이선스가 없거나 알 수 없는 경우)
  const defaultLicense = {
    fullName: repo?.licenseSpdxId || '라이선스 정보 없음',
    description: '이 저장소의 라이선스 정보를 확인할 수 없습니다.',
    permissions: [],
    conditions: [],
    limitations: [],
    color: 'gray',
  };

  // 현재 저장소의 라이선스 정보
  const currentLicense = licenseInfo[repo.licenseSpdxId] || defaultLicense;

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 탭 변경 시 localStorage에 저장
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('repoActiveTab', tab);
  };

  // 대화 초기화 함수
  const handleResetConversation = async () => {
    setChatLoading(true);
    setChatError('');
    try {
      await chatbotService.deleteConversation({ repoId, userId, accessToken });
      setConversationId(null);
      setChatMessages([]);
      setChatInput('');
      // 대화탭에 진입하면 새 대화가 자동 생성됨
    } catch {
      setChatError('대화 초기화에 실패했습니다.');
    }
    setChatLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              <h1 className="text-2xl font-bold tracking-tight dark:text-white">
                {repo.fullName?.split('/')[1] || repo.fullName}
              </h1>
              <Badge
                variant="secondary"
                className="dark:bg-gray-600 dark:text-gray-200"
              >
                공개
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{repo.star || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              <span>{repo.fork || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>{repo.issueTotalCount || 0}개 이슈</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>마지막 분석: {formatDate(repo.lastAnalyzedAt)}</span>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
                GitHub에서 보기
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="issues">이슈 목록</TabsTrigger>
            <TabsTrigger value="chatbot">AI 챗봇</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>README 요약</CardTitle>
                  <CardDescription>
                    AI가 분석한 저장소의 README 요약입니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p>
                      {repo.readmeSummaryGpt ||
                        repo.description ||
                        '분석된 README 요약이 없습니다.'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a
                      href={`${repo.htmlUrl}/blob/main/README.md`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      전체 README 보기
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">저장소 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="text-sm font-medium">사용 언어</div>
                      <div className="mt-2">
                        {repo?.languages && repo.languages.length > 0 ? (
                          <div className="space-y-3">
                            {/* 언어 비율 바 */}
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div className="h-full flex">
                                {repo.languages.map((lang) => (
                                  <div
                                    key={lang.languageName}
                                    className="h-full"
                                    style={{
                                      backgroundColor: languageUtils.getLanguageColor(
                                        lang.languageName
                                      ),
                                      width: `${lang.percentage}%`,
                                    }}
                                    title={`${lang.languageName
                                      }: ${lang.percentage.toFixed(1)}%`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* 언어 목록 */}
                            <div className="space-y-1">
                              {repo.languages.slice(0, 5).map((lang) => (
                                <div
                                  key={lang.languageName}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor: languageUtils.getLanguageColor(
                                          lang.languageName
                                        ),
                                      }}
                                    />
                                    <span className="font-medium">
                                      {lang.languageName}
                                    </span>
                                  </div>
                                  <span className="text-muted-foreground">
                                    {lang.percentage.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                              {repo.languages.length > 5 && (
                                <div className="text-xs text-muted-foreground pt-1">
                                  +{repo.languages.length - 5}개 언어 더
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            언어 정보가 없습니다
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 라이선스 정보 */}
                    <div className="pt-2">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm font-medium dark:text-white">
                          라이선스
                        </div>
                      </div>

                      <div className="mt-2 p-3 rounded-md border bg-muted/20 dark:bg-gray-800/50 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                          >
                            {currentLicense.fullName}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-600 mb-3 dark:text-gray-400">
                          {currentLicense.description}
                        </p>

                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center gap-1 text-xs font-medium text-green-600 mb-1 dark:text-green-400">
                              <Shield className="h-3 w-3" />
                              <span>허용 사항</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {currentLicense.permissions.map(
                                (permission, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600"
                                  >
                                    {permission}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-1 text-xs font-medium text-amber-600 mb-1 dark:text-amber-400">
                              <Info className="h-3 w-3" />
                              <span>조건</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {currentLicense.conditions.map(
                                (condition, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600"
                                  >
                                    {condition}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-1 text-xs font-medium text-red-600 mb-1 dark:text-red-400">
                              <AlertCircle className="h-3 w-3" />
                              <span>제한 사항</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {currentLicense.limitations.map(
                                (limitation, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600"
                                  >
                                    {limitation}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-center">
                          <a
                            href={`${repo.htmlUrl}/blob/main/LICENSE`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1 dark:text-purple-400"
                          >
                            전체 라이선스 보기
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium dark:text-white">
                        최근 업데이트
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 dark:text-gray-400">
                        {formatDate(repo.updatedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">이슈 통계</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm dark:text-gray-300">
                        총 이슈
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                      >
                        {repo.issueTotalCount || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm dark:text-gray-300">
                        Pull Requests
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600"
                      >
                        {repo.prTotalCount || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm dark:text-gray-300">
                        분석 상태
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          repo.analysisStatus === 'completed'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
                            : repo.analysisStatus === 'analyzing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
                              : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                        }
                      >
                        {repo.analysisStatus === 'completed'
                          ? '분석 완료'
                          : repo.analysisStatus === 'analyzing'
                            ? '분석 중'
                            : repo.analysisStatus === 'failed'
                              ? '분석 실패'
                              : '분석 전'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 이슈 목록 탭 */}
          <TabsContent value="issues" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                이슈 목록 기능은 준비 중입니다.
              </p>
            </div>
          </TabsContent>

          {/* AI 챗봇 탭 */}
          <TabsContent value="chatbot" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-3">
                  <CardTitle>컨트리뷰션 가이드 AI 챗봇</CardTitle>
                  <CardDescription>
                    저장소의 컨트리뷰션 문서를 학습한 AI 챗봇에게 질문하세요
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2 px-3 py-2 text-sm"
                  onClick={handleResetConversation}
                  disabled={chatLoading}
                  title="대화 초기화"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>대화 초기화</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg mb-4 h-[400px] overflow-y-auto flex flex-col space-y-4 dark:bg-gray-800">
                  {/* 안내 메시지 항상 맨 위에 */}
                  <div
                    className="max-w-[80%] rounded-lg p-3 self-start bg-primary-foreground text-gray-900 dark:bg-gray-700 dark:text-gray-200 text-left"
                  >
                    <p className="text-sm">{GUIDE_MESSAGE.content}</p>
                  </div>
                  {/* DB에서 불러온 메시지들 */}
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={msg.messageId || msg.tempId || idx}
                      className={`
      max-w-[80%] rounded-lg p-3
      ${msg.senderType === 'User'
        ? 'self-end bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-blue-100 text-right'
        : 'self-start bg-primary-foreground text-gray-900 dark:bg-gray-700 dark:text-gray-200 text-left'}
    `}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="질문을 입력하세요..."
                    className="flex-1"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    disabled={chatLoading}
                  />
                  <Button onClick={handleSendMessage} disabled={chatLoading || !chatInput.trim()}>
                    전송
                  </Button>
                </div>
                {chatError && (
                  <p className="text-xs text-red-500 mt-2">{chatError}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
