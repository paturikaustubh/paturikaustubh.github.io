import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";

import Hero from "./Pages/Hero/Hero";
import ProjectsList from "./Pages/Projects/ProjectsList";
import ProjectDetails from "./Pages/Projects/ProjectDetails";
import NotFound from "./components/NotFound/NotFound";
import MoreAboutMe from "./Pages/Projects/MoreAboutMe/MoreAboutMe";

export default function AnimatedRoutes() {
  const paths = [
    {
      path: "/portfolio/",
      element: <Hero />,
    },
    {
      path: "/portfolio/projects",
      element: <ProjectsList />,
    },
    {
      path: "/portfolio/projects/:name",
      element: <ProjectDetails />,
    },
    {
      path: "/portfolio/more-about-me",
      element: <MoreAboutMe />,
    },
    {
      path: "/portfolio/*",
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
