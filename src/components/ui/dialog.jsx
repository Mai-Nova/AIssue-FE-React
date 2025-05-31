import React from 'react';

function useThemeMode() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function Dialog({ open, onOpenChange, children }) {
  const mode = useThemeMode();

  const bgOverlay =
    mode === 'dark'
      ? 'rgba(15, 13, 24, 0.85)'
      : 'rgba(30, 28, 40, 0.75)';
  const modalBg =
    mode === 'dark'
      ? '#18132a'
      : '#232136';
  const modalColor = '#f3e8ff';
  const borderColor = mode === 'dark' ? '#6d28d9' : '#a5b4fc';
  const boxShadow =
    mode === 'dark'
      ? '0 16px 48px 0 rgba(40, 20, 80, 0.55)'
      : '0 8px 32px 0 rgba(40, 20, 80, 0.28)';

  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 1000,
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        background: bgOverlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.3s',
      }}
      onClick={() => onOpenChange(false)}
    >
      <div
        style={{
          background: modalBg,
          color: modalColor,
          borderRadius: 18,
          minWidth: 420,      // 기존 340 → 420
          maxWidth: 560,      // 기존 420 → 560
          padding: '44px 36px 28px 36px',
          boxShadow: boxShadow,
          border: `1.5px solid ${borderColor}`,
          position: 'relative',
          fontFamily: 'inherit',
          transition: 'background 0.3s, color 0.3s',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }) {
  return (
    <div
      style={{
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 20,
        letterSpacing: '0.02em',
        color: '#f3e8ff',
        textShadow: '0 1px 8px #1e1b4b33',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

// DialogContent
export function DialogContent({ children }) {
  return (
    <div
      className="py-2"
      style={{
        fontSize: 16,
        color: '#f3e8ff',
        lineHeight: 1.7,
        textAlign: 'center',
        wordBreak: 'keep-all',
        padding: '0 12px',
      }}
    >
      {children}
    </div>
  );
}

export function DialogFooter({ children }) {
  const mode = useThemeMode();
  const [hoverIdx, setHoverIdx] = React.useState(-1);

  const confirmBg = mode === 'dark' ? '#6d28d9' : '#6366f1';
  const confirmBgHover = mode === 'dark' ? '#7c3aed' : '#4f46e5';
  const confirmText = '#fff';

  const styledChildren = React.Children.map(children, (child, idx) => {
    if (!React.isValidElement(child)) return child;

    const baseStyle = {
      marginTop: 30,
      fontWeight: 600,
      fontFamily: 'inherit',
      fontSize: 15,
      letterSpacing: '0.01em',
      borderRadius: 8,
      padding: '8px 18px',
      transition: 'all 0.15s',
      outline: 'none',
      cursor: 'pointer',
      boxShadow: 'none',
      borderWidth: 1.5,
      borderStyle: 'solid',
      marginLeft: idx > 0 ? 8 : 0,
    };

    if (child.props.variant === 'outline') {
      const isHover = hoverIdx === idx;
      return React.cloneElement(child, {
        style: {
          ...baseStyle,
          color: mode === 'dark' ? '#cbd5e1' : '#334155',
          borderColor: mode === 'dark' ? '#334155' : '#cbd5e1',
          background: isHover
            ? (mode === 'dark' ? '#334155' : '#e2e8f0')
            : (mode === 'dark' ? '#232136' : '#f1f5f9'),
        },
        onMouseEnter: () => setHoverIdx(idx),
        onMouseLeave: () => setHoverIdx(-1),
      });
    }
    const isHover = hoverIdx === idx;
    return React.cloneElement(child, {
      style: {
        ...baseStyle,
        color: confirmText,
        background: isHover ? confirmBgHover : confirmBg,
        borderColor: 'transparent',
        boxShadow: '0 2px 8px 0 rgba(124,58,237,0.12)',
        opacity: isHover ? 0.97 : 1,
        filter: isHover ? 'brightness(1.04)' : 'none',
      },
      onMouseEnter: () => setHoverIdx(idx),
      onMouseLeave: () => setHoverIdx(-1),
    });
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 14,
        marginTop: 0,      // 버튼 위 간격 최소화
        marginBottom: 0,   // 버튼 아래 여백 완전 제거
      }}
    >
      {styledChildren}
    </div>
  );
}