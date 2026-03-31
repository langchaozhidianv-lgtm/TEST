import React, { createContext, useCallback, useMemo, useState } from "react";
import { fetchDashboard } from "../api/projectAPI";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  // Keep a stable no-op error handler so pages can call showError without surfacing modal noise.
  const showError = useCallback(() => {}, []);
  const closeError = useCallback(() => {}, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard();
      setDashboard(data);
    } catch (error) {
      // Swallow dashboard fetch errors in the prototype UI; pages remain visible even if backend is unavailable.
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      dashboard,
      loading,
      loadDashboard,
      errorModal: { open: false, title: "", message: "" },
      showError,
      closeError
    }),
    [dashboard, loading, loadDashboard, showError, closeError]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
