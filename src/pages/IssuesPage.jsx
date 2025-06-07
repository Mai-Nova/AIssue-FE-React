import { useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { AlertCircle, Clock, Pin, PinOff, Search } from 'lucide-react';
import DashboardLayout from '../components/dashboard-layout';
import { mockIssues, mockRecentIssues } from '../lib/mock-data';
import { NotificationContext } from '../contexts/notificationContext';

export default function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentIssues, setRecentIssues] = useState(mockRecentIssues);
  const [allIssues, setAllIssues] = useState(mockIssues);
  const { isConnected } = useContext(NotificationContext);
  console.log(`알림 연결 상태: ${isConnected ? '연결됨' : '끊김'}`);

  const togglePin = (issueId) => {
    // 최근 본 이슈 목록 업데이트
    const updatedRecentIssues = recentIssues.map((issue) => {
      if (issue.id === issueId) {
        return { ...issue, isPinned: !issue.isPinned };
      }
      return issue;
    });
    setRecentIssues(updatedRecentIssues);

    // 전체 이슈 목록 업데이트
    const updatedAllIssues = allIssues.map((issue) => {
      if (issue.id === issueId) {
        return { ...issue, isPinned: !issue.isPinned };
      }
      return issue;
    });
    setAllIssues(updatedAllIssues);
  };

  const filteredIssues = allIssues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.repoName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 고정된 이슈를 상단에 표시하기 위한 정렬 함수
  const sortIssues = (issues) => {
    return [...issues].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime();
    });
  };

  const sortedRecentIssues = sortIssues(recentIssues);
  const sortedAllIssues = useMemo(
    () => sortIssues(filteredIssues),
    [filteredIssues]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight dark:text-white">
              이슈
            </h1>
            <p className="text-muted-foreground dark:text-gray-300">
              최근 본 이슈와 모든 이슈를 확인하고 관리하세요
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="이슈 검색"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">최근 본 이슈</TabsTrigger>
            <TabsTrigger value="all">모든 이슈</TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="space-y-4">
            {sortedRecentIssues.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {sortedRecentIssues.map((issue) => (
                  <Card
                    key={issue.id}
                    className="transition-all hover:shadow-md dark:hover:shadow-lg"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                            >
                              {issue.repoName}
                            </Badge>
                            <Badge
                              variant={
                                issue.state === 'open' ? 'default' : 'secondary'
                              }
                              className={
                                issue.state === 'open'
                                  ? 'bg-green-500 dark:bg-green-600'
                                  : 'dark:bg-gray-600 dark:text-gray-200'
                              }
                            >
                              {issue.state === 'open' ? '열림' : '닫힘'}
                            </Badge>
                            <CardDescription className="dark:text-gray-400">
                              #{issue.number}
                            </CardDescription>
                          </div>
                          <Link
                            to={`/repository/${issue.repoId}/issue/${issue.number}`}
                          >
                            <CardTitle className="text-base font-medium hover:text-primary dark:text-white dark:hover:text-purple-400">
                              {issue.title}
                            </CardTitle>
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              togglePin(issue.id);
                            }}
                          >
                            {issue.isPinned ? (
                              <Pin className="h-4 w-4 fill-purple-600 text-purple-600" />
                            ) : (
                              <PinOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 dark:text-gray-300">
                        {issue.body}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {issue.labels.map((label) => (
                          <Badge
                            key={label.name}
                            variant="outline"
                            className="bg-opacity-10 dark:border-opacity-50"
                            style={{
                              backgroundColor: `${label.color}20`,
                              borderColor: label.color,
                            }}
                          >
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="dark:text-gray-400">
                          마지막 조회: {issue.viewedAt}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="rounded-full bg-purple-100 p-3 mb-4 dark:bg-purple-900/30">
                    <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 dark:text-white">
                    최근 본 이슈가 없습니다
                  </h3>
                  <p className="text-center text-muted-foreground mb-4 dark:text-gray-300">
                    저장소에서 이슈를 확인하면 이 곳에 표시됩니다
                  </p>
                  <Button asChild>
                    <Link to="/dashboard">저장소 목록으로 이동</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="all" className="space-y-4">
            {sortedAllIssues.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {sortedAllIssues.map((issue) => (
                  <Card
                    key={issue.id}
                    className="transition-all hover:shadow-md"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                            >
                              {issue.repoName}
                            </Badge>
                            <Badge
                              variant={
                                issue.state === 'open' ? 'default' : 'secondary'
                              }
                              className={
                                issue.state === 'open'
                                  ? 'bg-green-500 dark:bg-green-600'
                                  : 'dark:bg-gray-600 dark:text-gray-200'
                              }
                            >
                              {issue.state === 'open' ? '열림' : '닫힘'}
                            </Badge>
                            <CardDescription className="dark:text-gray-400">
                              #{issue.number}
                            </CardDescription>
                          </div>
                          <Link
                            to={`/repository/${issue.repoId}/issue/${issue.number}`}
                          >
                            <CardTitle className="text-base font-medium hover:text-primary dark:text-white dark:hover:text-purple-400">
                              {issue.title}
                            </CardTitle>
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              togglePin(issue.id);
                            }}
                          >
                            {issue.isPinned ? (
                              <Pin className="h-4 w-4 fill-purple-600 text-purple-600" />
                            ) : (
                              <PinOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 dark:text-gray-300">
                        {issue.body}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {issue.labels.map((label) => (
                          <Badge
                            key={label.name}
                            variant="outline"
                            className="bg-opacity-10 dark:border-opacity-50"
                            style={{
                              backgroundColor: `${label.color}20`,
                              borderColor: label.color,
                            }}
                          >
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="dark:text-gray-400">
                          {issue.user} 님이 {issue.createdAt}에 작성
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="rounded-full bg-purple-100 p-3 mb-4 dark:bg-purple-900/30">
                    <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 dark:text-white">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-center text-muted-foreground mb-4 dark:text-gray-300">
                    다른 검색어로 다시 시도해보세요
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
