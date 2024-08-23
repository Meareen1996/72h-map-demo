
import React, { Suspense,lazy } from 'react';
import { createHashRouter,Navigate } from 'react-router-dom';

const Layout = lazy(() => import('@pages/Layout'));
const ListPage = lazy(() => import('@pages/list'));
const MapPage = lazy(() => import('@pages/map'));
const NotFound = lazy(() => import('@pages/notFound'));

const ProtectedRoute = ({ children }) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {children}
        </Suspense>
    );
};

const router = createHashRouter([
    {
        path: '/',
        element: <ProtectedRoute><Layout /></ProtectedRoute>,
        children: [
            {
                path: '', // Changed index to an empty string to match the default route
                element: <Navigate to="/map" /> // Redirect from root to /map
            },
            {
                path: '/map',
                element: <ProtectedRoute><MapPage /></ProtectedRoute>
            },
            {
                path: '/list',
                element: <ProtectedRoute><ListPage /></ProtectedRoute>
            }
        ]
    },
    {
        path: '*',
        element: <ProtectedRoute><NotFound /></ProtectedRoute>
    }
]);


export default router;
