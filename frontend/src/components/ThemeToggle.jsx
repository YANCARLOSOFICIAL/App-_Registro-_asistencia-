import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
