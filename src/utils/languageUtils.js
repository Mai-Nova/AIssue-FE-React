// 언어별 대표 색상 반환
function getLanguageColor(language) {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    Go: '#00ADD8',
    Rust: '#dea584',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Shell: '#89e051',
    Assembly: '#6E4C13',
    'Jupyter Notebook': '#DA5B0B',
    XML: '#0060ac',
    Gradle: '#02303a',
    Perl: '#0298c3',
  };
  // 미등록 언어는 보라색 계열 기본값
  return colors[language] || '#8b5cf6';
}

export default {
  getLanguageColor,
};
