import { NavLink } from "react-router-dom";

const MobileBottomNav = () => {
  const item = (label: string, to: string, icon: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center py-2 ${
          isActive ? "text-red-600" : "text-gray-500"
        }`
      }
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-0.5">{label}</span>
    </NavLink>
  );

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-sm sm:hidden">
      <div className="flex">
        {item("Premium", "/premium", "⭐")}
        {item("Home", "/browse", "🏠")}
        {item("Contact us", "/contact", "✉️")}
        {item("Account", "/account", "👤")}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
