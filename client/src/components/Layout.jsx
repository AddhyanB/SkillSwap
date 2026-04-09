import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  // hide navbar only on auth pages
  const hideNavbarRoutes = ["/login", "/signup"];

  const shouldHideNavbar =
    !user || hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app-shell text-white">
      {/* NAVBAR */}
      {!shouldHideNavbar && <Navbar />}

      {/* PAGE CONTENT */}
      <div
        className={
          shouldHideNavbar
            ? "min-h-screen"
            : "h-[calc(100vh-72px)] overflow-y-auto"
        }
      >
        {children}
      </div>

    </div>
  );
}

export default Layout;
