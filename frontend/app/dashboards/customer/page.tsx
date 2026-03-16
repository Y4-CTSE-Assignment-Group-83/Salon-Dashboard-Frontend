import PrivateRoute from "@/components/PrivateRoutes";
import StudentDashboardPage from "@/app/dashboards/customer/CustomerDashboardPage";

export default function StudentDashboard() {
  return (
    <PrivateRoute allowedRoles={["CUSTOMER"]}>
      <StudentDashboardPage />
    </PrivateRoute>
  );
}
