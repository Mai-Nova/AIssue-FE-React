import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { AlertCircle, Clock, Search, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { NotificationContext } from '../contexts/notificationContext';
import DashboardLayout from '../components/dashboard-layout';
import repositoryService from '../services/repositoryService';

export default function DashboardPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [analyzingRepositories, setAnalyzingRepositories] = useState([]);
  const [newRepositories, setNewRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useContext(NotificationContext);
  const inputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    loadDashboardData();
    console.log(`알림 연결 상태: ${isConnected ? '연결됨' : '끊김'}`);
    if (location.state?.from === 'repositories') {
      inputRef.current?.focus();
    }
  }, [location, isConnected]);

  const checkAnalysisProgress = useCallback(async () => {
    const updatedRepositories = [];
    let hasCompletedRepo = false;
    let hasFailedRepo = false;
    let failedRepoMessages = [];

    for (const repo of analyzingRepositories) {
      const statusResult = await repositoryService.getAnalysisStatus(repo.id);

      if (statusResult.success) {
        const updatedRepo = {
          ...repo,
          ...statusResult.data,
          // Flask에서 받은 추가 정보들 포함
          progress: statusResult.data.progress || repo.progress || 0,
          currentStep: statusResult.data.currentStep || repo.currentStep,
          etaText: statusResult.data.etaText || '계산 중...',
          estimatedCompletion:
            statusResult.data.estimatedCompletion || repo.estimatedCompletion,
        };
        if (updatedRepo.status === 'completed') {
          hasCompletedRepo = true;
          // 완료된 저장소는 새로운 저장소 목록으로 이동
          setNewRepositories((prev) => [updatedRepo, ...prev]);
        } else if (updatedRepo.status === 'failed') {
          hasFailedRepo = true;

          // 오류 타입에 따른 사용자 친화적 메시지 생성
          let userFriendlyMessage = '분석에 실패했습니다.';

          if (updatedRepo.errorType) {
            switch (updatedRepo.errorType) {
              case 'REPOSITORY_SIZE_EXCEEDED':
                userFriendlyMessage = `${updatedRepo.fullName}: 저장소 크기가 5MB를 초과하여 분석할 수 없습니다.`;
                break;
              case 'REPOSITORY_ACCESS_DENIED':
                userFriendlyMessage = `${updatedRepo.fullName}: 저장소에 접근할 권한이 없습니다.`;
                break;
              case 'REPOSITORY_NOT_FOUND':
                userFriendlyMessage = `${updatedRepo.fullName}: 저장소를 찾을 수 없습니다.`;
                break;
              case 'REPOSITORY_ARCHIVED':
                userFriendlyMessage = `${updatedRepo.fullName}: 아카이브된 저장소는 분석할 수 없습니다.`;
                break;
              case 'REPOSITORY_DISABLED':
                userFriendlyMessage = `${updatedRepo.fullName}: 비활성화된 저장소는 분석할 수 없습니다.`;
                break;
              case 'FLASK_ERROR':
                userFriendlyMessage = `${updatedRepo.fullName}: 분석 서버 오류가 발생했습니다.`;
                break;
              case 'FLASK_CONNECTION_ERROR':
                userFriendlyMessage = `${updatedRepo.fullName}: 분석 서버에 연결할 수 없습니다.`;
                break;
              case 'FLASK_TIMEOUT_ERROR':
                userFriendlyMessage = `${updatedRepo.fullName}: 분석 요청 시간이 초과되었습니다.`;
                break;
              case 'DATABASE_ERROR':
                userFriendlyMessage = `${updatedRepo.fullName}: 데이터베이스 오류가 발생했습니다.`;
                break;
              case 'VALIDATION_ERROR':
                userFriendlyMessage = `${updatedRepo.fullName}: 검증 오류가 발생했습니다.`;
                break;
              default:
                userFriendlyMessage = `${updatedRepo.fullName}: ${
                  updatedRepo.errorMessage || '알 수 없는 오류가 발생했습니다.'
                }`;
                break;
            }
          } else if (updatedRepo.errorMessage) {
            userFriendlyMessage = `${updatedRepo.fullName}: ${updatedRepo.errorMessage}`;
          }

          failedRepoMessages.push(userFriendlyMessage);

          // 실패한 저장소는 분석 중 목록에서 제거
          console.error('저장소 분석 실패:', updatedRepo.errorMessage);
        } else {
          updatedRepositories.push(updatedRepo);
        }
      } else {
        updatedRepositories.push(repo);
      }
    }

    setAnalyzingRepositories(updatedRepositories);

    // 완료된 저장소가 있으면 알림 표시
    if (hasCompletedRepo) {
      console.log('저장소 분석이 완료되었습니다!');
    }

    // 실패한 저장소가 있으면 구체적인 에러 표시
    if (hasFailedRepo && failedRepoMessages.length > 0) {
      const errorMessage =
        failedRepoMessages.length === 1
          ? failedRepoMessages[0]
          : `다음 저장소들의 분석이 실패했습니다:\n\n${failedRepoMessages.join(
              '\n'
            )}`;

      setErrorMessage(errorMessage);
      setShowError(true);

      // 오류 메시지를 더 오래 표시 (여러 저장소 실패 시)
      const hideTimeout = failedRepoMessages.length > 1 ? 10000 : 7000;
      setTimeout(() => setShowError(false), hideTimeout);
    }
  }, [
    analyzingRepositories,
    setNewRepositories,
    setErrorMessage,
    setShowError,
  ]);

  // 분석 중인 저장소 상태 폴링
  useEffect(() => {
    if (analyzingRepositories.length > 0) {
      const interval = setInterval(() => {
        checkAnalysisProgress();
      }, 5000); // 5초마다 상태 확인

      return () => clearInterval(interval);
    }
  }, [analyzingRepositories, checkAnalysisProgress]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [analyzingResult, recentResult] = await Promise.all([
        repositoryService.getAnalyzingRepositories(),
        repositoryService.getRecentlyAnalyzedRepositories(),
      ]);
      if (analyzingResult.success) {
        setAnalyzingRepositories(analyzingResult.data);
      }

      if (recentResult.success) {
        setNewRepositories(recentResult.data);
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateGitHubUrl = (url) => {
    const githubUrlPattern =
      /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/;
    return githubUrlPattern.test(url.trim());
  };

  const handleAnalyzeRepo = async (e) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      setErrorMessage('GitHub 저장소 URL을 입력해주세요.');
      setShowError(true);
      return;
    }

    if (!validateGitHubUrl(repoUrl)) {
      setErrorMessage(
        '유효한 GitHub 저장소 URL을 입력해주세요. (예: https://github.com/username/repo)'
      );
      setShowError(true);
      return;
    }

    setShowError(false);
    setIsAnalyzing(true);

    try {
      const result = await repositoryService.analyzeRepository(repoUrl.trim());

      if (result.success) {
        setRepoUrl('');

        // 분석 시작된 저장소를 분석 중 목록에 추가
        const newAnalyzingRepo = {
          id: result.data.repositoryId,
          name: result.data.name,
          fullName: result.data.fullName,
          description: result.data.description || '분석 중인 저장소',
          progress: result.data.progress || 0,
          status: result.data.status || 'analyzing',
          startedAt: result.data.startedAt || new Date().toISOString(),
          estimatedCompletion: result.data.estimatedCompletion,
        };

        setAnalyzingRepositories((prev) => [newAnalyzingRepo, ...prev]);

        // 성공 메시지 표시 (선택사항)
        console.log('저장소 분석이 시작되었습니다:', result.message);
      } else {
        // 오류 타입에 따른 사용자 친화적 메시지 표시
        let userFriendlyMessage = result.message;

        // 백엔드에서 errorType을 제공하는 경우 처리
        if (result.errorType) {
          switch (result.errorType) {
            case 'REPOSITORY_SIZE_EXCEEDED':
              userFriendlyMessage = `저장소 크기가 너무 큽니다. 현재 서비스는 5MB 이하의 저장소만 분석 가능합니다.\n\n${result.message}`;
              break;
            case 'REPOSITORY_NOT_FOUND':
              userFriendlyMessage =
                '저장소를 찾을 수 없습니다. URL이 올바른지 확인해주세요.';
              break;
            case 'REPOSITORY_ACCESS_DENIED':
              userFriendlyMessage =
                '저장소에 접근할 권한이 없습니다. 공개 저장소인지 확인해주세요.';
              break;
            case 'REPOSITORY_ARCHIVED':
              userFriendlyMessage =
                '아카이브된 저장소는 분석할 수 없습니다. 활성 상태의 저장소를 선택해주세요.';
              break;
            case 'REPOSITORY_DISABLED':
              userFriendlyMessage =
                '비활성화된 저장소는 분석할 수 없습니다. 다른 저장소를 선택해주세요.';
              break;
            case 'GITHUB_AUTH_REQUIRED':
              userFriendlyMessage =
                'GitHub 인증이 필요합니다. 잠시 후 다시 시도해주세요.';
              break;
            case 'FLASK_CONNECTION_ERROR':
              userFriendlyMessage =
                '분석 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
              break;
            case 'FLASK_TIMEOUT_ERROR':
              userFriendlyMessage =
                '분석 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
              break;
            case 'INVALID_GITHUB_URL':
              userFriendlyMessage =
                '올바른 GitHub URL 형식이 아닙니다. (예: https://github.com/owner/repo)';
              break;
            case 'MISSING_REPO_URL':
            case 'EMPTY_REPO_URL':
              userFriendlyMessage = 'GitHub 저장소 URL을 입력해주세요.';
              break;
            case 'DATABASE_ERROR':
              userFriendlyMessage =
                '데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
              break;
            case 'VALIDATION_ERROR':
              userFriendlyMessage = `입력 데이터가 올바르지 않습니다: ${result.message}`;
              break;
            default:
              // 기본 메시지 사용
              break;
          }
        }

        setErrorMessage(userFriendlyMessage);
        setShowError(true);

        // 자동으로 에러 메시지 숨김 (크기 초과 오류는 더 오래 표시)
        const hideTimeout =
          result.errorType === 'REPOSITORY_SIZE_EXCEEDED' ? 8000 : 5000;
        setTimeout(() => setShowError(false), hideTimeout);
      }
    } catch (error) {
      console.error('저장소 분석 요청 오류:', error);
      setErrorMessage(
        '저장소 분석 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 남은 시간 표시 함수 (Flask의 etaText 우선 사용)
  const getDisplayTime = (repo) => {
    // Flask에서 받은 etaText가 있으면 우선 사용
    if (repo.etaText) {
      return repo.etaText;
    }

    // 기존 로직 (fallback)
    if (!repo.estimatedCompletion) return '계산 중...';

    const remaining = new Date(repo.estimatedCompletion).getTime() - Date.now();
    if (remaining <= 0) return '완료 예정';

    const minutes = Math.floor(remaining / 60000);
    if (minutes < 1) return '곧 완료';
    return `약 ${minutes}분 남음`;
  };

  // 진행 단계 표시 함수
  const getProgressStepText = (repo) => {
    if (repo.currentStep) {
      return repo.currentStep;
    }

    const progress = repo.progress || 0;
    if (progress <= 5) return '저장소 정보 확인 중...';
    if (progress <= 10) return '저장소 복제 중...';
    if (progress <= 20) return '코드 파일 로드 중...';
    if (progress <= 50) return '코드 임베딩 생성 중...';
    if (progress <= 70) return '문서 파일 로드 중...';
    if (progress <= 90) return '문서 임베딩 생성 중...';
    return '분석 완료 중...';
  };

  // 분석 완료된 저장소 클릭 시 페이지 이동
  const handleRepositoryClick = async (repo) => {
    try {
      // 마지막 조회 시간 업데이트
      await repositoryService.updateRepositoryLastViewed(repo.id);

      // 로컬 상태에서 해당 저장소를 새로운 저장소 목록에서 제거
      setNewRepositories((prev) => prev.filter((r) => r.id !== repo.id));

      // 저장소 페이지로 이동
      navigate(`/repository/${repo.id}`, {
        state: {
          from: 'dashboard',
          isNewlyAnalyzed: true,
        },
      });
    } catch (error) {
      console.error('저장소 클릭 처리 중 오류:', error);
      // 오류가 발생해도 페이지 이동은 계속 진행
      navigate(`/repository/${repo.id}`, {
        state: {
          from: 'dashboard',
          isNewlyAnalyzed: true,
        },
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">대시보드를 로드하는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">
            GitHub 저장소를 분석하고 이슈를 AI로 해결해보세요
          </p>
        </div>

        {/* 저장소 분석 입력 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>GitHub 저장소 분석</CardTitle>
            <CardDescription>
              분석하고 싶은 GitHub 저장소의 URL을 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyzeRepo} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="GitHub 저장소 URL 입력 (예: https://github.com/username/repo)"
                  className="pl-9"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>
              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing ? '분석 중...' : '분석하기'}
              </Button>
            </form>

            {showError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 분석 중인 저장소 */}
        {analyzingRepositories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">분석 중인 저장소</h2>
            <div className="grid grid-cols-1 gap-4">
              {analyzingRepositories.map((repo) => (
                <Card key={repo.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-medium">
                          {repo.name}
                        </CardTitle>
                        <CardDescription>{repo.fullName}</CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          repo.status === 'failed'
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600'
                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
                        }
                      >
                        {repo.status === 'failed' ? '분석 실패' : '분석 중'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>진행률: {repo.progress || 0}%</span>
                        <span>{getDisplayTime(repo)}</span>
                      </div>
                      <Progress
                        value={repo.progress || 0}
                        className={`h-2 ${
                          repo.status === 'failed' ? 'bg-red-100' : ''
                        }`}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p
                          className={`text-xs ${
                            repo.status === 'failed'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {repo.status === 'failed'
                            ? repo.errorMessage || '분석 중 오류가 발생했습니다'
                            : getProgressStepText(repo)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {repo.status === 'failed'
                            ? '다시 시도해주세요'
                            : '완료 시 자동으로 이동됩니다'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 새로운 저장소 */}
        {newRepositories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">새로 분석된 저장소</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newRepositories.map((repo) => (
                <Card
                  key={repo.id}
                  className="h-full transition-all hover:shadow-md dark:hover:shadow-lg cursor-pointer"
                  onClick={() => handleRepositoryClick(repo)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-medium dark:text-white">
                          {repo.name}
                        </CardTitle>
                        <Badge className="bg-green-500 dark:bg-green-600">
                          NEW
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge
                          variant={repo.isPrivate ? 'outline' : 'secondary'}
                          className={
                            repo.isPrivate
                              ? 'dark:border-gray-600 dark:text-gray-300'
                              : 'dark:bg-gray-600 dark:text-gray-200'
                          }
                        >
                          {repo.isPrivate ? '비공개' : '공개'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 h-10 dark:text-gray-300">
                      {repo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        분석 완료: {repo.lastAnalyzed || repo.completedAt}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 분석 중인 저장소와 새 저장소가 모두 없는 경우 */}
        {analyzingRepositories.length === 0 && newRepositories.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 pt-4">
              <div className="rounded-full bg-purple-100 p-3 mb-4 dark:bg-purple-900/30">
                <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-2 dark:text-white">
                분석할 저장소를 추가해보세요
              </h3>
              <p className="text-center text-muted-foreground mb-4 dark:text-gray-300">
                GitHub 저장소 URL을 입력하여 AI 분석을 시작해보세요
              </p>
              <Button onClick={() => inputRef.current?.focus()}>
                저장소 분석하기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
