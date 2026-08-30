import React, { useState, useEffect } from "react";
// import { useLogout } from "../Logout/logout";
import { sideBarNavigate } from "../../router/navigate";
import { NavLink } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import Footer from "../Footer/footer";
import "./sidebar.css";

export default function Sidebar({ children, userRole = 2, userData = {} }) {
  // const logout = useLogout();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = sideBarNavigate[userRole] || sideBarNavigate[2];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar-layout ${isCollapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          {!isCollapsed && <h3>Finance Tracker</h3>}
          <button type="button" onClick={toggleSidebar} className="toggle-btn">
            <i
              className={isCollapsed ? "pi pi-angle-right" : "pi pi-angle-left"}
            ></i>
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item, index) => {
            return (
              <NavLink
                key={index}
                to={item.path}
                title={isCollapsed ? item.title : ""}
                className={({ isActive }) =>
                  isActive ? "menu-item active" : "menu-item"
                }
              >
                <span className="icon">
                  {item.icon && <i className={item.icon} style={{ color: item.iconColor }}></i>}
                </span>
                {!isCollapsed && <span className="label">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            Logout!
          </button>
        </div> */}
      </aside>

      <main className="main-content flex flex-col justify-between min-h-screen">
        <div>
          <header className="topbar">
            <div className="topbar-title">
              {/* test */}
            </div>

            <div className="topbar-right">
              {/* <div className="icon-badge-wrapper">
                <i className="pi pi-bell text-x1 text-gray-600"></i>
                <Badge value="2" severity={"danger"}></Badge>
              </div> */}

              <div className="user-panel">
                <Avatar
                  icon="pi pi-user"
                  className="bg-sky-600"
                  shape="circle"
                  size="normal"
                />
                <div className="user-info">
                  <span className="user-name">
                    {userData?.name || "คเชนทร์ จันทเกษ"}
                  </span>
                  <span className="user-role">
                    {userRole === 1 ? "Administrator" : "User Staff"}
                  </span>
                </div>
                {/* <button
                  type="button"
                  onClick={logout}
                  className="logout-icon-btn"
                  title="ออกจากระบบ"
                >
                  <i className="pi pi-power-off text-red-500 hover:text-red-700"></i>
                </button> */}
              </div>
            </div>
          </header>
        </div>
        <div className="content-body">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
