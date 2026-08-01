import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Global shortcut: Ctrl/Cmd + Shift + A opens the admin login portal.
 * The portal itself still requires valid admin credentials.
 */
export const AdminHotkey = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  return null;
};
