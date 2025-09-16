// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { MainLayout } from './layouts/MainLayout';
// import { Home } from './pages/Home';
// import { Profile } from './pages/Profile';
// import { StudyGroup } from './pages/StudyGroup';
// import { Upload } from './pages/Upload';
// import { Messages } from './pages/Messages';
// import { HeroSection } from "../../../f/src/components/HeroSection";
// import { ResourcePage } from "./pages/ResourcePage"; // ✅ Import the new ResourcePage

// export function AppRouter() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Default redirect */}
//         <Route path="/" element={<Navigate to="/home" replace />} />

//         {/* Main routes */}
//         <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
//         <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
//         <Route path="/profile/:id" element={<MainLayout><Profile /></MainLayout>} /> {/* Profile by ID */}
//         <Route path="/groups" element={<MainLayout><StudyGroup /></MainLayout>} />
//         <Route path="/upload" element={<MainLayout><Upload /></MainLayout>} />
//         <Route path="/messages" element={<MainLayout><Messages /></MainLayout>} />
//         <Route path="/hero" element={<MainLayout><HeroSection /></MainLayout>} />

//         {/* Resource page route */}
//         <Route path="/resource/:id" element={<MainLayout><ResourcePage /></MainLayout>} />

//         {/* Catch-all redirect */}
//         <Route path="*" element={<Navigate to="/home" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
