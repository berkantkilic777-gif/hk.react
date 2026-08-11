import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const rol = localStorage.getItem("ogrenciRol");

  if (rol !== "Admin") {
    return <Navigate to="/anasayfa" replace />;
  }

  return children;
}

export default AdminRoute;