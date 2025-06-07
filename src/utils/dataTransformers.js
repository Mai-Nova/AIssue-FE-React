// DB 저장소 데이터를 프론트엔드 형식으로 변환
function transformRepositoryData(dbRepo) {
  return {
    id: dbRepo.repoId.toString(),
    name: dbRepo.fullName.split('/')[1] || dbRepo.fullName,
    fullName: dbRepo.fullName,
    description: dbRepo.description || '설명이 없습니다.',
    stars: dbRepo.star || 0,
    forks: dbRepo.fork || 0,
    issues: dbRepo.issueTotalCount || 0,
    isPrivate: false,
    lastAnalyzed: formatDate(dbRepo.lastAnalyzedAt),
    isFavorite: dbRepo.isFavorite || false,
    isNew: isNewRepository(dbRepo.createdAt),
    githubRepoId: dbRepo.githubRepoId,
    language: dbRepo.primaryLanguage,
    languagePercentage: dbRepo.primaryLanguagePercentage,
    languages: dbRepo.languages || [],
    license: dbRepo.licenseSpdxId,
    readmeSummary: dbRepo.readmeSummaryGpt,
    htmlUrl: dbRepo.htmlUrl,
    analysisStatus: dbRepo.analysisStatus,
    analysisProgress: dbRepo.analysisProgress,
    analysisCompletedAt: dbRepo.analysisCompletedAt,
  };
}

// 날짜 포맷팅 함수
function formatDate(dateString) {
  if (!dateString) return '분석되지 않음';

  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return '오늘';
  if (diffInDays === 1) return '어제';
  if (diffInDays < 7) return `${diffInDays}일 전`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;

  return date.toLocaleDateString('ko-KR');
}

// 새 저장소 여부 확인 (7일 이내 추가된 경우)
function isNewRepository(createdAt) {
  if (!createdAt) return false;

  const created = new Date(createdAt);
  const now = new Date();
  const diffInDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

  return diffInDays <= 7;
}

export default {
  transformRepositoryData,
  formatDate,
  isNewRepository,
};
