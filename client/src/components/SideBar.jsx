import { useNavigate, NavLink } from "react-router";

export const SideBar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <div className="h-screen w-64 bg-base-200 text-base-content flex flex-col shadow-lg">
        <div className="p-4 text-xl font-bold text-primary">CMS Dashboard</div>
        <ul className="menu p-2 flex-1">
          <li>
            <NavLink
              to="/cms/home"
              className={({ isActive }) =>
                isActive
                  ? "active bg-primary text-primary-content rounded-lg"
                  : ""
              }
            >
              Course & Languages
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/cms/users"
              className={({ isActive }) =>
                isActive
                  ? "active bg-primary text-primary-content rounded-lg"
                  : ""
              }
            >
              Users
            </NavLink>
          </li>
        </ul>
        <div className="p-2 mt-auto">
          <button className="btn btn-error w-full" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};
