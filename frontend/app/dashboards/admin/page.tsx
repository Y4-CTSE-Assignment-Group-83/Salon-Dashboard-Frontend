import PrivateRoute from "@/components/PrivateRoutes";
import AdminDashboardPage from "@/app/dashboards/admin/AdminDashboardPage";

export default function AdminDashboard() {
  return (
    <PrivateRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardPage />
    </PrivateRoute>
  );
}
