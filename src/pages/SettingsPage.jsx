import { useState, useCallback } from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Github } from 'lucide-react';
import DashboardLayout from '../components/dashboard-layout';
import { useNavigate } from 'react-router-dom';
import { removeAuthStorage } from '../utils/auth';
import {
  unlinkGithubAccount,
  deleteGithubAccount,
} from '../services/authService';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '../components/ui/dialog';

function useAuthTokens() {
  return {
    token: localStorage.getItem('token'),
    accessToken: localStorage.getItem('accessToken'),
  };
}

function GithubUnlinkButton() {
  const navigate = useNavigate();
  const { token, accessToken } = useAuthTokens();
  const [open, setOpen] = useState(false);

  const handleUnlink = useCallback(async () => {
    if (!token) {
      alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
      navigate('/login');
      return;
    }

    const result = await unlinkGithubAccount();

    if (!result.success) {
      alert('연동 해제 실패: ' + result.message);
      return;
    }

    removeAuthStorage();
    navigate('/');
  }, [token, accessToken, navigate]);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        연동 해제
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>GitHub 연동 해제</DialogHeader>
          <div className="py-2">
            연동 해제 시, 이 서비스에서 GitHub 계정 연결이 완전히 끊어집니다.
            연동 해제 후에는 다시 연결해야 서비스를 이용할 수 있습니다.
            정말로 연동을 해제하시겠습니까?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleUnlink}>
              연동 해제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 계정 데이터 삭제 모달 버튼
function AccountDeleteButton() {
  const navigate = useNavigate();
  const { token, accessToken } = useAuthTokens();
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!token) {
      alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
      navigate('/login');
      return;
    }

    const result = await deleteGithubAccount();

    if (!result.success) {
      alert('계정 삭제 실패: ' + result.message);
      return;
    }

    removeAuthStorage();
    navigate('/');
  }, [token, accessToken, navigate]);

  return (
    <>
      <Button
        variant="destructive"
        className="w-full justify-center"
        onClick={() => setOpen(true)}
      >
        계정 데이터 삭제
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>계정 데이터 삭제</DialogHeader>
          <div className="py-2">
            계정 데이터를 삭제하면 모든 분석 결과, 설정 및 개인 정보가
            영구적으로 제거됩니다.
            이 작업은 되돌릴 수 없습니다.
            정말로 계정 데이터를 삭제하시겠습니까?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const username = localStorage.getItem('username') || 'githubuser';

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">설정</h1>
          <p className="text-muted-foreground">
            계정 설정 및 환경 설정을 관리합니다
          </p>
        </div>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
            <CardDescription>
              알림 및 이메일 수신 설정을 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">이메일 알림</Label>
                <p className="text-sm text-muted-foreground">
                  새로운 분석 결과 및 업데이트 알림을 이메일로 받습니다
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-notifications">브라우저 알림</Label>
                <p className="text-sm text-muted-foreground">
                  저장소 분석 완료 시 브라우저 알림을 받습니다
                </p>
              </div>
              <Switch id="browser-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* GitHub 연동 */}
        <Card>
          <CardHeader>
            <CardTitle>GitHub 연동 설정</CardTitle>
            <CardDescription>
              GitHub 계정 연동 및 권한 설정을 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label>GitHub 계정 연동</Label>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    연동됨
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  @{username} 계정과 연동되어 있습니다
                </p>
              </div>
              <Button variant="outline" size="sm">
                재연동
              </Button>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">권한 설정</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">저장소 읽기 권한</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    허용됨
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">이슈 읽기 권한</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    허용됨
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">이슈 쓰기 권한</span>
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    거부됨
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="gap-1">
              <Github className="h-4 w-4" />
              GitHub 권한 관리
            </Button>
            <GithubUnlinkButton />
          </CardFooter>
        </Card>

        {/* 고급 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>고급 설정</CardTitle>
            <CardDescription>계정 데이터 관리</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-4">
                계정 데이터를 삭제하면 모든 분석 결과, 설정 및 개인 정보가
                영구적으로 제거됩니다.
                이 작업은 되돌릴 수 없습니다.
                정말로 계정 데이터를 삭제하시겠습니까?
              </p>
              <AccountDeleteButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
