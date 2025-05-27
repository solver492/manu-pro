
import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientSitesPage from '@/pages/ClientSitesPage';
import SiteDetailPage from '@/pages/SiteDetailPage';
import SendHandlerPage from '@/pages/SendHandlerPage';
import StatisticsPage from '@/pages/StatisticsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { AuthContext } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
          <Route path="/sites" element={<AnimatedPage><ClientSitesPage /></AnimatedPage>} />
          <Route path="/sites/:id" element={<AnimatedPage><SiteDetailPage /></AnimatedPage>} />
          <Route path="/sites/:id/send" element={<AnimatedPage><SendHandlerPage /></AnimatedPage>} />
          <Route path="/stats" element={<AnimatedPage><StatisticsPage /></AnimatedPage>} />
        </Route>
        <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
      </Routes>
    </Layout>
  );
}

export default App;
  