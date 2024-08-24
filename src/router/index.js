import React, { Suspense, lazy } from "react";
import PropTypes from "prop-types";
import { createHashRouter, Navigate } from "react-router-dom";
import ErrorBoundary from "@components/errorBoundary"; // 引入ErrorBoundary组件
const Layout = lazy(() => import("@pages/Layout"));
const ListPage = lazy(() => import("@pages/list"));
const MapPage = lazy(() => import("@pages/map"));
const NotFound = lazy(() => import("@pages/notFound"));

const SuspenseWrapper = ({ children }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
  );
};

SuspenseWrapper.propTypes = {
  children: PropTypes.node,
};

const router = createHashRouter([
  {
    path: "/",
    element: (
      <SuspenseWrapper>
        <Layout />
      </SuspenseWrapper>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/map" />, // Redirect from root to /map
      },
      {
        path: "map",
        element: (
          <SuspenseWrapper>
            <MapPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "list",
        element: (
          <SuspenseWrapper>
            <ListPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <SuspenseWrapper>
        <NotFound />
      </SuspenseWrapper>
    ),
  },
]);

export default router;
