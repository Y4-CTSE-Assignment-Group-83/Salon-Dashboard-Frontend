import PrivateRoute from "@/components/PrivateRoutes";
import ReviewerDashboardPage from "@/app/dashboards/reviewer/StaffDashboardPage";

export default function SuperAdminDashboard() {
  return (
    <PrivateRoute allowedRoles={["REVIEWER"]}>
      <ReviewerDashboardPage />
    </PrivateRoute>
  );
}
