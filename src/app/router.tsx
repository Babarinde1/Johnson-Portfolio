import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./RootLayout";

const HomePage = lazy(() => import("../pages/HomePage"));
const ProjectsPage = lazy(() => import("../pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("../pages/ProjectDetailPage"));
const LabPage = lazy(() => import("../pages/LabPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ResumePage = lazy(() => import("../pages/ResumePage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const AdminPage = lazy(() => import("../pages/AdminPage"));
const ErrorPage = lazy(() => import("../pages/ErrorPage"));

function RouteFallback() {
  return (
    <div className="container route-loading" role="status" aria-live="polite">
      Loading page…
    </div>
  );
}
const load = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

// /admin is protected by Supabase Auth + RLS, not by obscurity.
export const router = createBrowserRouter([
  {
    path: "/admin",
    element: load(<AdminPage />),
    errorElement: load(<ErrorPage />),
  },
  {
    element: <RootLayout />,
    errorElement: load(<ErrorPage />),
    children: [
      { path: "/", element: load(<HomePage />) },
      { path: "/projects", element: load(<ProjectsPage />) },
      { path: "/projects/:slug", element: load(<ProjectDetailPage />) },
      { path: "/lab", element: load(<LabPage />) },
      { path: "/about", element: load(<AboutPage />) },
      { path: "/resume", element: load(<ResumePage />) },
      { path: "/contact", element: load(<ContactPage />) },
      { path: "*", element: load(<NotFoundPage />) },
    ],
  },
]);
