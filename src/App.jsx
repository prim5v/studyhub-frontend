import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Layout & Pages
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { StudyGroup } from "./pages/StudyGroup";
import { Upload } from "./pages/Upload";
import { Messages } from "./pages/Messages";
import { ResourcePage } from "./pages/ResourcePage";

// Landing Components
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { LoginModal } from "./components/LoginModal";
import { SignupModal } from "./components/SignupModal";
import { Chat } from "./pages/Chat";
import { MyNotesPage } from "./pages/MyNotesPage";
import { SearchPage } from "./pages/SearchPage";
import { Grouping } from "./pages/Grouping";
import { IntroModal } from "./components/IntroModal";

// ---------------- Landing Page Wrapper ----------------
function LandingPageWrapper() {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    console.log("LandingPageWrapper mounted. Stored user:", storedUser);

    if (storedUser && storedUser.user_id) {
      // Navigate to home immediately
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  };

  const openSignup = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-white">
      <Header onLoginClick={openLogin} onSignupClick={openSignup} />
      <main className="w-full">
        <HeroSection onSignupClick={openSignup} />
      </main>

      {/* Login / Signup Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeModals}
        onSwitchToSignup={openSignup}
        onShowIntro={() => setShowIntro(true)} // trigger intro modal after login
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={closeModals}
        onSwitchToLogin={openLogin}
      />

      {/* Intro Modal */}
      <IntroModal
        isOpen={showIntro}
        onClose={() => {
          console.log("Intro modal closed");
          setShowIntro(false);
        }}
      />
    </div>
  );
}

// ---------------- Main App ----------------
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPageWrapper />} />

        {/* Main App Pages */}
        <Route path="/home" element={<MainLayout><Home /></MainLayout>} />

        {/* Redirect /profile to /profile/me for logged-in user */}
        <Route path="/profile" element={<Navigate to="/profile/me" replace />} />

        {/* Profile Page with user_id param */}
        <Route path="/profile/:id" element={<MainLayout><Profile /></MainLayout>} />

        {/* Study Group */}
        <Route path="/groups/:id" element={<MainLayout><StudyGroup /></MainLayout>} />

        {/* Upload, Messages, Hero */}
        <Route path="/upload" element={<MainLayout><Upload /></MainLayout>} />
        <Route path="/messages" element={<MainLayout><Chat /></MainLayout>} />
        <Route path="/messages/:conversationId" element={<MainLayout><Chat /></MainLayout>} />
        <Route path="/hero" element={<MainLayout><HeroSection /></MainLayout>} />
        <Route path="/notes" element={<MainLayout><MyNotesPage /></MainLayout>} />
        <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
        <Route path="/groups" element={<MainLayout><Grouping /></MainLayout>} />

        {/* Resource Page */}
        <Route path="/resource/:id" element={<MainLayout><ResourcePage /></MainLayout>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


// import React, { useState, useEffect } from "react";
// import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

// // Layout & Pages
// import { MainLayout } from "./layouts/MainLayout";
// import { Home } from "./pages/Home";
// import { Profile } from "./pages/Profile";
// import { StudyGroup } from "./pages/StudyGroup";
// import { Upload } from "./pages/Upload";
// import { Messages } from "./pages/Messages";

// // Landing Components
// import { Header } from "./components/Header";
// import { HeroSection } from "./components/HeroSection";
// import { LoginModal } from "./components/LoginModal";
// import { SignupModal } from "./components/SignupModal";

// function LandingPageWrapper() {
//   const navigate = useNavigate();
//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [isSignupOpen, setIsSignupOpen] = useState(false);

//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     if (storedUser && storedUser.user_id) {
//       // Auto-login if user exists in localStorage
//       navigate("/home");
//     }
//   }, [navigate]);

//   const openLogin = () => {
//     setIsLoginOpen(true);
//     setIsSignupOpen(false);
//   };

//   const openSignup = () => {
//     setIsSignupOpen(true);
//     setIsLoginOpen(false);
//   };

//   const closeModals = () => {
//     setIsLoginOpen(false);
//     setIsSignupOpen(false);
//   };

//   return (
//     <div className="relative w-full min-h-screen bg-white">
//       <Header onLoginClick={openLogin} onSignupClick={openSignup} />
//       <main className="w-full">
//         <HeroSection onSignupClick={openSignup} />
//       </main>
//       <LoginModal
//         isOpen={isLoginOpen}
//         onClose={closeModals}
//         onSwitchToSignup={openSignup}
//       />
//       <SignupModal
//         isOpen={isSignupOpen}
//         onClose={closeModals}
//         onSwitchToLogin={openLogin}
//       />
//     </div>
//   );
// }

// export function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Landing Page with auto-login check */}
//         <Route path="/" element={<LandingPageWrapper />} />

//         {/* App Pages inside MainLayout */}
//         <Route
//           path="/home"
//           element={
//             <MainLayout>
//               <Home />
//             </MainLayout>
//           }
//         />
//         <Route
//           path="/profile/"
//           element={
//             <MainLayout>
//               <Profile />
//             </MainLayout>
//           }
//         />
//         <Route
//           path="/group/:id"
//           element={
//             <MainLayout>
//               <StudyGroup />
//             </MainLayout>
//           }
//         />
//         <Route
//           path="/upload"
//           element={
//             <MainLayout>
//               <Upload />
//             </MainLayout>
//           }
//         />
//         <Route
//           path="/messages"
//           element={
//             <MainLayout>
//               <Messages />
//             </MainLayout>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }
