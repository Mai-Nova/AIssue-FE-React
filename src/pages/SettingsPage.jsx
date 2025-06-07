import { useState, useCallback, useContext } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Github, AlertTriangle } from 'lucide-react';
import { NotificationContext } from '../contexts/notificationContext';
import authUtils from '../utils/auth';
import authService from '../services/authService';
import DashboardLayout from '../components/dashboard-layout';
import notificationService from '../services/notificationService';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '../components/ui/dialog';
import ModalBody from '../components/ui/ModalBody';

function GithubUnlinkButton() {
  const accessToken = localStorage.getItem('accessToken');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnlink = useCallback(async () => {
    if (loading) return; // 중복 방지
    setLoading(true);
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const result = await authService.unlinkAccount();

    if (!result.success) {
      setLoading(false);
      return;
    }

    authUtils.removeAuthStorage();
    window.location.replace('/');
  }, [accessToken, loading]);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        연동 해제
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <ModalBody
            icon={<AlertTriangle size={28} color="#f59e42" />}
            title="GitHub 연동 해제"
            description={`연동 해제 시, 이 서비스에서 GitHub 계정 연결이 완전히 끊어집니다.\n연동 해제 후에는 다시 연결해야 서비스를 이용할 수 있습니다.\n정말로 연동을 해제하시겠습니까?`}
            warning="⚠️ 연동 해제 후 서비스 이용이 제한될 수 있습니다."
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnlink}
              disabled={loading}
            >
              {loading ? '연동 해제 중...' : '연동 해제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 계정 데이터 삭제 모달 버튼
function AccountDeleteButton() {
  const accessToken = localStorage.getItem('accessToken');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const result = await authService.deleteAccount();

    if (!result.success) {
      setLoading(false);
      return;
    }

    authUtils.removeAuthStorage();
    window.location.replace('/');
  }, [accessToken, loading]);

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
          <ModalBody
            icon={<AlertTriangle size={28} color="#ef4444" />}
            title="계정 데이터 삭제"
            description={`계정 데이터를 삭제하면 모든 분석 결과, 설정 및 개인 정보가\n영구적으로 제거됩니다.\n이 작업은 되돌릴 수 없습니다.\n정말로 계정 데이터를 삭제하시겠습니까?`}
            warning="⚠️ 이 작업은 되돌릴 수 없습니다."
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SettingsPage() {
  const { isConnected } = useContext(NotificationContext);
  console.log(`알림 연결 상태: ${isConnected ? '연결됨' : '끊김'}`);
  const username = localStorage.getItem('username') || 'githubuser';
  const [emailNotifications, setEmailNotifications] = useState(false);

  // 브라우저 알림 관련
  const NOTIFICATION_PERMISSION_KEY = 'notificationPermissionStatus';
  const currentStatus = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
  // 토글 버튼의 checked 상태를 제어하는 state
  const [browserNotifications, setBrowserNotifications] = useState(() => {
    if (
      !currentStatus ||
      currentStatus === 'default' ||
      currentStatus === 'denied'
    ) {
      return false;
    } else if (currentStatus === 'granted') {
      return true;
    }
  });

  // 토글 버튼 클릭 핸들러
  const handleBrowserNotificationToggle = async (checked) => {
    try {
      if (checked) {
        // 알림을 켜려고 할 때만 권한 요청
        const permissionGranted = await notificationService.permissionNotificationWindow();
        if (permissionGranted) {
          localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
          setBrowserNotifications(true);
          // SSE 연결 트리거
          window.dispatchEvent(new Event('notificationPermissionChanged'));
        } else {
          // 권한이 거부되면 토글을 다시 꺼진 상태로
          localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'denied');
          setBrowserNotifications(false);
          window.dispatchEvent(new Event('notificationPermissionChanged'));
        }
      } else {
        // 알림을 끄려고 할 때는 권한 요청 없이 바로 처리
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'denied');
        setBrowserNotifications(false);
        // SSE 연결 해제 트리거
        window.dispatchEvent(new Event('notificationPermissionChanged'));
      }
    } catch (error) {
      console.error('알림 권한 요청 오류:', error);
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'denied');
      setBrowserNotifications(false);
      window.dispatchEvent(new Event('notificationPermissionChanged'));
    }
  };

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
              <Switch
                id="browser-notifications"
                checked={browserNotifications}
                onCheckedChange={handleBrowserNotificationToggle}
              />
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
                영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다. 정말로 계정
                데이터를 삭제하시겠습니까?
              </p>
              <AccountDeleteButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
