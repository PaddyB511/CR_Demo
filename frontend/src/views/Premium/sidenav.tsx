import React from "react";
import { NavLink } from "react-router-dom";

export default function SideNav() {
  const item =
    "flex items-center gap-3 h-10 px-3 rounded-pill border border-border bg-surface hover:bg-surface-muted";
  const active =
    "ring-1 ring-[--color-chip-selected-border] bg-chip-selected text-brand";

  return (
    <aside className="hidden md:block w-[260px] shrink-0">
      <nav className="space-y-3">
        <NavLink to="/browse" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
          <span className="h-3 w-3 rounded bg-[#d9d9d9] inline-block" />
          Home
        </NavLink>

        <NavLink to="/premium" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
          <span className="h-3 w-3 rounded bg-brand inline-block" />
          Go premium
        </NavLink>

        <NavLink to="/contact" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
          <span className="h-3 w-3 rounded bg-[#d9d9d9] inline-block" />
          Contact us
        </NavLink>
      </nav>
    </aside>
  );
}
