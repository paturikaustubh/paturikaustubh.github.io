import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Hero from "./Pages/Hero/Hero";
import ProjectsList from "./Pages/Projects/ProjectsList";
import ProjectDetails from "./Pages/Projects/ProjectDetails";
import NotFound from "./components/NotFound/NotFound";
import MoreAboutMe from "./Pages/Projects/MoreAboutMe/MoreAboutMe";
import ExperienceList from "./Pages/Experience/ExperienceList";
import ExperienceDetails from "./Pages/Experience/ExperienceDetails";

const RedirectToRoot = () => {
  const location = useLocation();
  // Replace /portfolio with empty string, default to / if empty
  const newPath = location.pathname.replace(/^\/portfolio/, "") || "/";
  // Preserve search params and hash
  return <Navigate to={newPath + location.search + location.hash} replace />;
};

export default function AnimatedRoutes() {
  const paths = [
    {
      path: "/",
      element: <Hero />,
    },
    {
      path: "/projects",
      element: <ProjectsList />,
    },
    {
      path: "/projects/:name",
      element: <ProjectDetails />,
    },
    {
      path: "/more-about-me",
      element: <MoreAboutMe />,
    },
    {
      path: "/experience",
      element: <ExperienceList />,
    },
    {
      path: "/experience/:name",
      element: <ExperienceDetails />,
    },
    {
      path: "/portfolio/*",
      element: <RedirectToRoot />,
    },
    {
      path: "/*",
      element: <NotFound />,
    },
  ];
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {paths.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </AnimatePresence>
  );
}
