import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";

import BrowsePage from "./views/BrowsePage";
import WatchPage from "./views/WatchPage.tsx";
import ProgressPage from "./views/ProgressPage";
import JournalPage from "./views/JournalPage";
import Premium from "./views/Premium/premium.tsx";
import Contact from "./views/Contact/contact.tsx";
import Account from "./views/Account/Account";

import TopBar from "./views/Premium/topbar";
import SignUpWizard from "./views/Auth/SignUpWizard";

function AppLayout() {
  const [openSignUp, setOpenSignUp] = useState(false);

  return (
    <>
      <TopBar
        onSignUpClick={() => setOpenSignUp(true)}
        // onLoginClick={() => setOpenLogin(true)} // add later if you also build a login modal
      />
      <main>
        <Outlet />
      </main>
      <SignUpWizard open={openSignUp} onClose={() => setOpenSignUp(false)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/browse" replace />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
