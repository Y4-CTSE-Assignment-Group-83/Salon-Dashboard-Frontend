import PrivateRoute from "@/components/PrivateRoutes";
import StaffDashboardPage from "@/app/dashboards/staff/StaffDashboardPage";

export default function SuperAdminDashboard() {
  return (
    <PrivateRoute allowedRoles={["STAFF"]}>
      <StaffDashboardPage />
    </PrivateRoute>
  );
}
