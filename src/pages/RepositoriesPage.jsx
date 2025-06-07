import { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCircle, Github, Plus, Search, Star, GitFork, Clock, Trash2 } from 'lucide-react';
import { NotificationContext } from '../contexts/notificationContext';
import languageUtils from '../utils/languageUtils';
import DashboardLayout from '../components/dashboard-layout';
import dataTransformers from '../utils/dataTransformers';
import repositoryService from '../services/repositoryService';

export default function RepositoriesPage() {
  const { isConnected } = useContext(NotificationContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [favoriteRepositories, setFavoriteRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabValue = searchParams.get('tab') || 'all';

  // 저장소 목록 로드
  useEffect(() => {
    loadRepositories();
    console.log(`알림 연결 상태: ${isConnected ? '연결됨' : '끊김'}`);
  }, [isConnected]);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await repositoryService.getUserRepositories();

      if (result.success) {
        const transformedRepos = result.data.map(dataTransformers.transformRepositoryData);
        setRepositories(transformedRepos);

        // 즐겨찾기 필터링
        const favorite = transformedRepos.filter((repo) => repo.isFavorite);
        setFavoriteRepositories(favorite);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('저장소 목록을 불러오는데 실패했습니다.');
      console.error('저장소 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavoriteStatus = async (e, repoId) => {
    e.preventDefault();
    e.stopPropagation();

    const repo = repositories.find((r) => r.id === repoId);
    if (!repo) return;

    try {
      const result = await repositoryService.updateFavoriteStatus(repoId, !repo.isFavorite);
      if (result.success) {
        const updatedRepositories = repositories.map((repo) =>
          repo.id === repoId ? { ...repo, isFavorite: !repo.isFavorite } : repo
        );
        setRepositories(updatedRepositories);

        if (repo.isFavorite) {
          setFavoriteRepositories(
            favoriteRepositories.filter((r) => r.id !== repoId)
          );
        } else {
          setFavoriteRepositories([
            ...favoriteRepositories,
            { ...repo, isFavorite: true },
          ]);
        }
      } else {
        alert(result.message || '즐겨찾기 상태 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('즐겨찾기 상태 업데이트 오류:', err);
      alert('즐겨찾기 상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteRepository = async (e, githubRepoId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('정말로 이 저장소를 삭제하시겠습니까?')) return;

    try {
      const result = await repositoryService.removeRepositoryFromTracking(githubRepoId);

      if (result.success) {
        // 성공 시 목록 새로고침
        await loadRepositories();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('저장소 삭제에 실패했습니다.');
      console.error('저장소 삭제 오류:', err);
    }
  };

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFavoriteRepositories = favoriteRepositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderRepositoryCard = (repo) => (
    <Card
    key={repo.id}
    className="h-full min-h-[180px] transition-all hover:shadow-lg rounded-xl bg-white dark:bg-gray-900 group" // border 클래스 제거
    >
      <CardHeader className="pb-2 relative">
        <div className="flex items-center min-w-0 gap-2 flex-nowrap">
          {/* Github 아이콘을 button으로 변경 */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              window.open(repo.htmlUrl || repo.url, '_blank', 'noopener,noreferrer');
            }}
            className="mr-1 p-0 bg-transparent border-0 flex-shrink-0 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            tabIndex={-1}
            title="GitHub 저장소로 이동"
          >
            <Github className="h-5 w-5" />
          </button>
          <CardTitle className="text-base font-semibold group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
            {repo.name}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 ml-1">
            {repo.isNew && <Badge className="bg-green-500 text-white flex-shrink-0">NEW</Badge>}
            <Badge variant={repo.isPrivate ? 'outline' : 'secondary'} className="flex-shrink-0">
              {repo.isPrivate ? '비공개' : '공개'}
            </Badge>
          </div>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="!h-10 !w-10 min-w-0 p-0 flex-shrink-0"
            onClick={(e) => toggleFavoriteStatus(e, repo.id)}
          >
            <Star
              className={`h-4 w-4 ${repo.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
            />
          </Button>
        </div>
        <CardDescription className="line-clamp-2 h-10 mt-3 text-gray-600 dark:text-gray-300">
          {repo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3 mt-0">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>{repo.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            <span>{repo.forks}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            <span>{repo.issues}개 이슈</span>
          </div>
          {/* 주요 언어 표시 */}
          {repo.language && (
            <div className="flex items-center gap-1 ml-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: languageUtils.getLanguageColor(repo.language) }}
              />
              <span className="font-medium">{repo.language}</span>
              {repo.languagePercentage && (
                <span className="text-muted-foreground">
                  {repo.languagePercentage.toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <hr className="border-gray-200 dark:border-gray-700" />
      <CardFooter className="text-xs text-muted-foreground flex flex-col gap-1 pt-3 pb-3 pr-3 relative">
        {/* 버튼 위에만 구분선 - 카드 전체 너비로(음수 마진) */}
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>마지막 분석: {repo.lastAnalyzed}</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center text-sm mb-0"
            onClick={(e) => handleDeleteRepository(e, repo.githubRepoId)}
            title="저장소 삭제"
          >
            <Trash2 className="w-4 h-3" />
            <span>삭제</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const handleTabChange = (value) => {
    setSearchParams({ tab: value });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">저장소 목록을 불러오는 중...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-red-600">오류가 발생했습니다</div>
          <div className="text-sm text-gray-600">{error}</div>
          <Button onClick={loadRepositories}>다시 시도</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* 상단 구분선 삭제 */}
      {/* <hr className="mb-6 border-gray-200 dark:border-gray-700" /> */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">저장소</h1>
            <p className="text-muted-foreground">
              분석한 GitHub 저장소 목록을 확인하세요
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="저장소 검색"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={tabValue} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="all">모든 저장소</TabsTrigger>
            <TabsTrigger value="starred">즐겨찾기</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {filteredRepositories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRepositories.map((repo) => (
                  <Link to={`/repository/${repo.id}`} key={repo.id}>
                    {renderRepositoryCard(repo)}
                  </Link>
                ))}

                <Card className="h-full border-dashed">
                  <Link to="/dashboard" state={{ from: 'repositories' }}>
                    <CardContent className="flex flex-col items-center justify-center h-full p-6 pt-4">
                      <div className="rounded-full bg-purple-100 p-3 mb-4">
                        <Plus className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold leading-none tracking-tight mb-2">
                        저장소 추가하기
                      </h3>
                      <p className="text-center text-muted-foreground">
                        새 GitHub 저장소를 분석하고 AI의 도움을 받아보세요
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 pt-6">
                  <div className="rounded-full bg-purple-100 p-3 mb-4">
                    <Github className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    {searchQuery
                      ? '검색 결과가 없습니다'
                      : '아직 분석한 저장소가 없습니다'}
                  </h3>
                  <p className="text-center text-muted-foreground mb-4">
                    {searchQuery
                      ? '다른 검색어로 다시 시도해보세요'
                      : 'GitHub 저장소 URL을 입력하여 AI 분석을 시작해보세요'}
                  </p>
                  {!searchQuery && (
                    <Button asChild>
                      <Link to="/dashboard">저장소 분석하기</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="starred">
            {filteredFavoriteRepositories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavoriteRepositories.map((repo) => (
                  <Link to={`/repository/${repo.id}`} key={repo.id}>
                    {renderRepositoryCard(repo)}
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 pt-6">
                  <div className="rounded-full bg-amber-100 p-3 mb-4">
                    <Star className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    {searchQuery
                      ? '검색 결과가 없습니다'
                      : '즐겨찾기한 저장소가 없습니다'}
                  </h3>
                  <p className="text-center text-muted-foreground mb-4">
                    {searchQuery
                      ? '다른 검색어로 다시 시도해보세요'
                      : '저장소 목록에서 별표 아이콘을 클릭하여 자주 사용하는 저장소를 즐겨찾기하세요'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {/* 하단 구분선 삭제 */}
      {/* <hr className="mt-8 border-gray-200 dark:border-gray-700" /> */}
    </DashboardLayout>
  );
}
