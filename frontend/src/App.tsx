import { Routes, Route } from "react-router-dom"
import { UserLogin } from "./pages/user/UserLogin"
import { UserRegister } from "./pages/user/UserRegister"
import { CustomerDashboard } from "./pages/customer/CustomerDashboard"
import { CleanerDashboard } from "./pages/cleaner/CleanerDashboard"
import { OwnerDashboard } from "./pages/owner/OwnerDashboard"
import { OrderPage } from "./pages/sofaCleaningOrder/OrderPage"
import { ManagerDashboard } from "./pages/manager/ManagerDashboard"
import { CustomerProtectedRoute } from "./protectedRoutes/CustomerProtectedRoute"
import { CleanerProtectedRoute } from "./protectedRoutes/CleanerProtectedRoute"
import { ManagerProtectedRoute } from "./protectedRoutes/ManagerProtectedRoute"
import { OwnerProtectedRoute } from "./protectedRoutes/OwnerProtectedRoute"
import { UserProtectedRoute } from "./protectedRoutes/UserProtectedRoute"
import { useAppDispatch } from "./redux/hooks"
import { useEffect } from "react"
import { fetchLoggedInUser } from "./redux/userThunk"

function App() {

  const dispatch = useAppDispatch();

  // Fetch logged in user globally when the app mounts
  useEffect(() => {
    dispatch(fetchLoggedInUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<UserLogin />} /> {/* login */}
      <Route path="/register" element={<UserRegister />} />

      <Route path="/customer">
        <Route path="dashboard" element={<CustomerProtectedRoute><CustomerDashboard /></CustomerProtectedRoute>} />
      </Route>

      <Route path="/cleaner">
        <Route path="dashboard" element={<CleanerProtectedRoute><CleanerDashboard /></CleanerProtectedRoute>} />
      </Route>

      <Route path="/manager">
        <Route path="dashboard" element={<ManagerProtectedRoute><ManagerDashboard /></ManagerProtectedRoute>} />
      </Route>

      <Route path="/owner">
        <Route path="dashboard" element={<OwnerProtectedRoute><OwnerDashboard /></OwnerProtectedRoute>} />
      </Route>

      <Route path="/sofa-cleaning-order/:oid" element={<UserProtectedRoute><OrderPage /></UserProtectedRoute>} />
    </Routes>
  )
}

export default App