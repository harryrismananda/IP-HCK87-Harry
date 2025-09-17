import { useNavigate, NavLink } from "react-router";

export const SideBar = ({ onClose }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose) onClose(); // Close mobile sidebar after navigation
  };

  return (
    <div className="h-screen w-64 lg:w-72 bg-base-200 text-base-content flex flex-col shadow-lg">
      {/* Mobile close button */}
      {onClose && (
        <div className="lg:hidden p-4 border-b border-base-300">
          <button 
            className="btn btn-square btn-ghost btn-sm ml-auto"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="p-4 text-lg lg:text-xl font-bold text-primary border-b border-base-300">
        CMS Dashboard
      </div>
      <ul className="menu p-2 flex-1 gap-1">
        <li>
          <NavLink
            to="/cms/home"
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "active bg-primary text-primary-content rounded-lg"
                : "hover:bg-base-300 rounded-lg"
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm lg:text-base">Course & Languages</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/cms/users"
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "active bg-primary text-primary-content rounded-lg"
                : "hover:bg-base-300 rounded-lg"
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-sm lg:text-base">Users</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/cms/questions"
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "active bg-primary text-primary-content rounded-lg"
                : "hover:bg-base-300 rounded-lg"
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm lg:text-base">Questions</span>
          </NavLink>
        </li>
      </ul>
      <div className="p-2 mt-auto border-t border-base-300">
        <button className="btn btn-error w-full text-sm lg:text-base" onClick={handleLogout}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};
