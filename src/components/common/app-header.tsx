import { useNavigate } from 'react-router';

function AppHeader() {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate('/reward');
  };
  return (
    <header className="flex items-center justify-center pt-20">
      <div className="flex items-center justify-center">
        <img
          src="/assets/logo_text.svg"
          alt="FLOCA Logo"
          className="h-32 w-auto cursor-pointer"
          onClick={handleLogoClick}
        />
      </div>
    </header>
  );
}

export { AppHeader };
