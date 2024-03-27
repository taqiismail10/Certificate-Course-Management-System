import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// import Courses from "./pages/Courses.tsx";
import Navbar from "./components/Navbar.tsx";

import SignUpForm from "./components/SignUpForm.tsx";
import SignUpForm_2 from "./components/SignUpForm_2.tsx";
import LoginForm from "./components/LoginForm.tsx";
import StudentDashboard from "./components/StudentDashboard.tsx";
import LandingPage from "./components/LandingPage.tsx";
import TeacherDashboard from "./components/TeacherDashboard.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import SignUp_temp from "./components/SignUp_temp.tsx";
import AdminLoginForm from "./components/AdminLoginForm.tsx";
// import TeacherProfile from "./components/TeacherProfile.tsx";
import CreateCourseForm from "./components/CreateCourseForm.tsx";


const router = createBrowserRouter([
  {
    path: "/signup",
    element: <SignUpForm/>
  },
  {
    path: "/signup_2",
    element: <SignUpForm_2/>
  },
  {
    path: "/login",
    element: <LoginForm/>
  },
  {
    path: "/student-dashboard/:id",
    element: <StudentDashboard/>
  },
  {
    path: "/teacher-dashboard/:id",
    element: <TeacherDashboard/>
  },
  // {
  //   path: "/teacher-dashboard/profile",
  //   element: <TeacherProfile/>
  // },
  {
    path: "/",
    element: <LandingPage/>
  },
  // {
  //   path: "/test",
  //   element: <Test/>
  // },
  {
    path: "/admin-dashboard",
    element: <AdminDashboard/>
  },
  {
    path: "/admin-login",
    element: <AdminLoginForm/>
  },
  {
    path: "/course-create",
    element: <CreateCourseForm/>
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    {/* <SignUp_temp/> */}
  </React.StrictMode>
);
