import { apiRequest } from './api.js';
import { handleError } from './errorHandler.js';

// handleError 확장: 기본 data 값도 받을 수 있도록 수정
function handleRepoError(error, defaultMsg, defaultData = []) {
  const result = handleError(error, defaultMsg);
  return { ...result, data: defaultData };
}

// 사용자 트래킹 저장소 목록 조회
export async function getUserRepositories() {
  try {
    const response = await apiRequest('/repositories/tracked');
    return {
      success: true,
      data: response.repositories || [],
      message: response.message,
    };
  } catch (error) {
    return handleRepoError(error, '저장소 목록을 불러오는데 실패했습니다.', []);
  }
}

// 저장소 검색
export async function searchRepositories(query) {
  try {
    const response = await apiRequest(
      `/repositories/search?query=${encodeURIComponent(query)}`
    );
    return {
      success: true,
      data: response.repositories || [],
      message: response.message,
    };
  } catch (error) {
    return handleRepoError(error, '저장소 검색에 실패했습니다.', []);
  }
}

// 저장소 트래킹 추가
export async function addRepositoryToTracking(githubRepoId) {
  try {
    const response = await apiRequest('/repositories/tracked', {
      method: 'POST',
      body: JSON.stringify({ githubRepoId }),
    });
    return {
      success: true,
      data: response.repositories || [],
      message: response.message,
    };
  } catch (error) {
    return handleRepoError(error, '저장소 추가에 실패했습니다.', []);
  }
}

// 저장소 트래킹 삭제
export async function removeRepositoryFromTracking(githubRepoId) {
  try {
    const response = await apiRequest(
      `/repositories/tracked?githubRepoId=${githubRepoId}`,
      { method: 'DELETE' }
    );
    return {
      success: true,
      message: response.message,
      data: [],
    };
  } catch (error) {
    return handleRepoError(error, '저장소 삭제에 실패했습니다.', []);
  }
}

// ===== 새로 추가: 저장소 분석 관련 API =====

// 저장소 분석 시작
export async function analyzeRepository(repoUrl) {
  try {
    const response = await apiRequest('/repositories/analyze', {
      method: 'POST',
      body: JSON.stringify({ repoUrl }),
    });
    return {
      success: true,
      data: response.data || {},
      message: response.message,
      errorType: response.errorType,
    };
  } catch (error) {
    console.error('저장소 분석 시작 오류:', error);

    // 백엔드에서 전달된 오류 정보 추출
    let errorType = 'UNKNOWN_ERROR';
    let errorMessage = error.message || '저장소 분석 시작에 실패했습니다.';

    if (error.response?.data) {
      errorType = error.response.data.errorType || errorType;
      errorMessage = error.response.data.message || errorMessage;
    }

    return {
      success: false,
      data: null,
      message: errorMessage,
      errorType: errorType,
    };
  }
}

// 저장소 분석 상태 조회
export async function getAnalysisStatus(repositoryId) {
  try {
    const response = await apiRequest(`/repositories/${repositoryId}/status`);
    return {
      success: true,
      data: response.data || {},
      message: response.message,
    };
  } catch (error) {
    console.error('분석 상태 조회 오류:', error);

    // 백엔드에서 전달된 오류 정보 추출
    let errorType = 'UNKNOWN_ERROR';
    let errorMessage = error.message || '분석 상태 조회에 실패했습니다.';

    if (error.response?.data) {
      errorType = error.response.data.errorType || errorType;
      errorMessage = error.response.data.message || errorMessage;
    }

    return {
      success: false,
      data: null,
      message: errorMessage,
      errorType: errorType,
    };
  }
}

// 분석 중인 저장소 목록 조회
export async function getAnalyzingRepositories() {
  try {
    const response = await apiRequest('/repositories/analyzing');
    return {
      success: true,
      data: response.repositories || [],
      message: response.message,
    };
  } catch (error) {
    console.error('분석 중인 저장소 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: error.message || '분석 중인 저장소 조회에 실패했습니다.',
    };
  }
}

// 최근 분석 완료된 저장소 목록 조회
export async function getRecentlyAnalyzedRepositories() {
  try {
    const response = await apiRequest('/repositories/recently-analyzed');
    return {
      success: true,
      data: response.repositories || [],
      message: response.message,
    };
  } catch (error) {
    console.error('최근 분석 완료 저장소 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: error.message || '최근 분석 완료 저장소 조회에 실패했습니다.',
    };
  }
}

// 저장소 상세 정보 조회
export async function getRepositoryDetails(repoId) {
  try {
    const response = await apiRequest(`/repositories/${repoId}/details`);
    return {
      success: true,
      data: response.data || {},
      message: response.message,
    };
  } catch (error) {
    console.error('저장소 상세 정보 조회 오류:', error);
    return {
      success: false,
      data: null,
      message: error.message || '저장소 상세 정보 조회에 실패했습니다.',
    };
  }
}

// 저장소 조회 시 마지막 조회 시간 업데이트
export async function updateRepositoryLastViewed(repoId) {
  try {
    const response = await apiRequest(`/repositories/${repoId}/viewed`, {
      method: 'PATCH',
    });
    return {
      success: true,
      message: response.message,
    };
  } catch (error) {
    console.error('마지막 조회 시간 업데이트 오류:', error);
    return {
      success: false,
      message: error.message || '마지막 조회 시간 업데이트에 실패했습니다.',
    };
  }
}

// 저장소 언어 정보 조회
export async function getRepositoryLanguages(repoId) {
  try {
    const response = await apiRequest(`/repositories/${repoId}/languages`);
    return {
      success: true,
      data: response.data || [],
      message: response.message,
    };
  } catch (error) {
    console.error('저장소 언어 정보 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: error.message || '저장소 언어 정보 조회에 실패했습니다.',
    };
  }
}

// 즐겨찾기 상태 업데이트
export async function updateFavoriteStatus(repoId, isFavorite) {
  try {
    const response = await apiRequest(`/repositories/${repoId}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ isFavorite }),
    });
    return {
      success: true,
      data: response.data || {},
      message: response.message,
    };
  } catch (error) {
    console.error('즐겨찾기 상태 업데이트 오류:', error);
    return {
      success: false,
      message: error.message || '즐겨찾기 상태 업데이트에 실패했습니다.',
    };
  }
}
