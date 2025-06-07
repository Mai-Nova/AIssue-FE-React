import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Github } from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import authUtils from '../utils/auth';
import api from '../services/api.js';

export default function LoginPage() {
  const [isLoading] = useState(false);

  const handleGithubLogin = () => {
    // 기존 토큰/정보 삭제
    authUtils.removeAuthStorage();
    // 실제 GitHub OAuth 인증 시작
    window.location.href = `${api.API_BASE_URL}/auth/github/login`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md mx-4 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center dark:text-white">
              로그인
            </CardTitle>
            <CardDescription className="text-center dark:text-gray-300">
              GitHub 계정으로 로그인하여 AIssue를 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-[#24292e] hover:bg-[#1b1f23] flex items-center justify-center gap-2"
              onClick={handleGithubLogin}
              disabled={isLoading}
            >
              <Github className="w-5 h-5" />
              {isLoading ? '로그인 중...' : 'GitHub로 로그인'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  또는
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                AIssue는 GitHub 계정을 통한 로그인만 지원합니다.
              </p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                GitHub 계정이 없으신가요?{' '}
                <a
                  href="https://github.com/join"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline dark:text-purple-400"
                >
                  GitHub 가입하기
                </a>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-center text-xs text-gray-500 w-full dark:text-gray-400">
              로그인함으로써 AIssue의{' '}
              <Link
                to="/terms-of-service"
                className="text-purple-600 hover:underline dark:text-purple-400"
              >
                서비스 약관
              </Link>{' '}
              및{' '}
              <Link
                to="/privacy-policy"
                className="text-purple-600 hover:underline dark:text-purple-400"
              >
                개인정보 처리방침
              </Link>
              에 동의합니다.
            </p>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
