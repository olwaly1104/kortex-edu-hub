import { Navigate } from "react-router-dom";

// Redirect to main dashboard - admissões is now integrated
export default function AdmissoesDashboard() {
  return <Navigate to="/secretaria" replace />;
}
