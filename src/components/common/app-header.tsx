import { useNavigate } from "react-router";

function AppHeader() {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate("/");
  };
  return (
    <header className="flex items-center justify-center p-14">
      <div className="flex items-center justify-center">
        <img
          src="/assets/sunglass.svg"
          alt="Sunglasses"
          className="h-16 w-auto cursor-pointer"
          onClick={handleLogoClick}
        />
      </div>
    </header>
  );
}

export { AppHeader };
