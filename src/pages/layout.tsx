import { AppFooter, AppHeader } from "@/components/common";
import { Outlet } from "react-router";

function RootLayout() {
  return (
    <div className="w-full h-screen">
      <AppHeader />
      <main className="w-full flex-1 flex justify-center">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export default RootLayout;
