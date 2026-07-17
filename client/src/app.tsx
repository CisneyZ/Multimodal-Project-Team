import React from 'react';
import { Route, Routes } from 'react-router-dom';

import AssessmentPage from './pages/AssessmentPage/AssessmentPage';
import AdminPage from './pages/AdminPage/AdminPage';
import ReviewPage from './pages/ReviewPage/ReviewPage';
import OnboardingPage from './pages/OnboardingPage/OnboardingPage';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<AssessmentPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;

