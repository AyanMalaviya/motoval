import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  fullScreen?: boolean;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  fullScreen = false,
  text,
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const Spinner = () => (
    <div className="relative">
      <div className={`${sizes[size]} rounded-full border-4 border-gray-700 border-t-transparent animate-spin`} />
      <div className={`absolute inset-0 ${sizes[size]} rounded-full border-4 border-transparent border-t-purple-500 animate-spin`} style={{ animationDuration: '1.5s' }} />
    </div>
  );

  const Dots = () => (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'} 
          rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );

  const Pulse = () => (
    <div className="relative flex items-center justify-center">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse`} />
      <div className={`absolute ${sizes[size]} rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-ping opacity-75`} />
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      default:
        return <Spinner />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {renderVariant()}
      {text && (
        <p className="text-gray-300 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
