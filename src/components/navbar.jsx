import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Github, Menu, X, User, LogOut, AlertTriangle } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import authService from '../services/authService';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from './ui/dialog';
import ModalBody from './ui/ModalBody';

export default function Navbar({ scrollToTop, scrollToSection, loggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const username = localStorage.getItem('username');
  const avatarUrl = localStorage.getItem('avatarUrl');
  const isLoggedIn = loggedIn;

  // 홈으로 이동하는 함수 (AIssue 로고 클릭)
  const handleNavigateToHome = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      if (location.pathname === '/') {
        if (scrollToTop) scrollToTop();
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
    }
  };

  // 로그인 상태에 따라 네비게이션 항목을 다르게(로그인 시 아무것도 안보임)
  const navigationItems = isLoggedIn ? [] : [
    {
      key: 'home',
      label: '홈',
      action: () => handleNavigateToHome(),
    },
    {
      key: 'features',
      label: '기능',
      action: () => handleNavigateToSection('features'),
    },
    {
      key: 'pricing',
      label: '가격 정책',
      action: () => handleNavigateToSection('pricing'),
    },
  ];


  // 메뉴 항목 렌더링 함수 (데스크톱)
  const renderDesktopMenuItem = (item) => (
    <button
      key={item.key}
      onClick={item.action}
      className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors cursor-pointer"
    >
      {item.label}
    </button>
  );

  // 메뉴 항목 렌더링 함수 (모바일)
  const renderMobileMenuItem = (item) => (
    <button
      key={item.key}
      onClick={() => {
        setIsMenuOpen(false);
        item.action();
      }}
      className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors w-full text-left cursor-pointer"
    >
      {item.label}
    </button>
  );

  // 로그아웃 처리 함수
  const [logoutLoading, setLogoutLoading] = useState(false); // 추가

  const handleLogout = async () => {
    if (logoutLoading) return; // 중복 방지
    setLogoutLoading(true);
    await authService.logout();
    window.location.replace('/');
  };

  const isHomePage = location.pathname === '/';

  // 특정 섹션으로 스크롤하는 함수 (props로 받지 않은 경우 기본 구현)
  const handleScrollToSection = (sectionId) => {
    if (scrollToSection) {
      scrollToSection(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // 섹션으로 이동하는 함수 (다른 페이지에서 홈페이지 섹션으로 이동)
  const handleNavigateToSection = (sectionId) => {
    if (isHomePage) {
      handleScrollToSection(sectionId);
    } else {
      // 다른 페이지에서는 홈페이지로 이동하면서 해시 추가
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-none container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-4">
          <button
            onClick={handleNavigateToHome}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              AIssue
            </span>
          </button>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-between">
          <nav className="flex items-center gap-6 text-sm">
            {navigationItems.map(renderDesktopMenuItem)}
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 dark:hover:ring-offset-background">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2 border-b border-border/50">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{username}</p>
                      <p className="text-xs text-muted-foreground">
                        @{username}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4" />내 프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <User className="w-4 h-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild>
                  <Link to="/login" className="gap-1">
                    <Github className="h-4 w-4" />
                    시작하기
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden flex flex-1 items-center justify-end">
          <ModeToggle />
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2 border-b border-border/50">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{username}</p>
                    <p className="text-xs text-muted-foreground">@{username}</p>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />내 프로필
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <User className="w-4 h-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map(renderMobileMenuItem)}
            </nav>

            {!isLoggedIn && (
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild className="w-full gap-1">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Github className="h-4 w-4" />
                    시작하기
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 로그아웃 확인 모달 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <ModalBody
            icon={<AlertTriangle size={28} color="#f59e42" />}
            title="로그아웃"
            description={`로그아웃 시, 이 서비스에서만 로그아웃되며\nGitHub 계정 연동은 유지됩니다.\n계속 진행하시겠습니까?`}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={logoutLoading}>취소</Button>
            <Button variant="destructive" onClick={handleLogout} disabled={logoutLoading}>
              {logoutLoading ? "로그아웃 중..." : "로그아웃"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
