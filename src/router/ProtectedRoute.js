import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, redirectTo = "/login" }) => {
    const userDetails = useSelector(state => state.userReducer.userDetails);
    console.log("userDe", userDetails);

    if (!userDetails || !userDetails.roleId) {
        console.log("Không tìm thấy userDetails, chuyển hướng về /login");
        return <Navigate to={redirectTo} replace />;
    }

    console.log("Role ID từ Redux:", userDetails.roleId);
    console.log("Danh sách role được phép:", allowedRoles);

    return allowedRoles.includes(userDetails.roleId)
        ? <Outlet />
        : <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
