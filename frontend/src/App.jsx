import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './store/authSlice.js';
import { useOfflineSync } from './hooks/useOfflineSync.js';

import Header from './components/common/Header.jsx';
import BottomNav from './components/common/BottomNav.jsx';
import VoiceOverlay from './components/voice/VoiceOverlay.jsx';
import VoiceConfirmationModal from './components/voice/VoiceConfirmationModal.jsx';
import UndoToast from './components/common/UndoToast.jsx';

import HomePage from './pages/HomePage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import AddExpensePage from './pages/AddExpensePage.jsx';
import AddIncomePage from './pages/AddIncomePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SummaryPage from './pages/SummaryPage.jsx';
import PlannedExpensesPage from './pages/PlannedExpensesPage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  // Initialize offline sync monitor
  useOfflineSync();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Hide header and bottom nav on onboarding
  const isOnboarding = location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-warm-100 flex flex-col font-sans">
      {!isOnboarding && <Header />}

      <main className="flex-1 w-full max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/add-expense" element={<AddExpensePage />} />
          <Route path="/add-income" element={<AddIncomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/planned" element={<PlannedExpensesPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      {!isOnboarding && <BottomNav />}

      {/* Global Modals & Notifications */}
      <VoiceOverlay />
      <VoiceConfirmationModal />
      <UndoToast />
    </div>
  );
}

