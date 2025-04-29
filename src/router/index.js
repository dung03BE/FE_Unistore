import InventoryManagement from "../admin/InventoryManagement";
import Dashboard from "../admin/Dashboard/Dashboard";

import LayoutAdmin from "../admin/LayoutAdmin";
import OrderManageMent from "../admin/OrderManagement";
import ProductCategories from "../admin/ProductCategories";
import ProductList from "../admin/ProductList";
import RecycleManagement from "../admin/RecycleManagement";
import UserManagement from "../admin/UserManagement";
import SystemSettings from "../admin/SystemSettings";
import VoucherManagement from "../admin/VoucherManagement";
import Announce from "../components/Announce/Announce";
import GreenPhone from "../components/GreenPhone/GreenPhone";
import Login from "../components/Login";
import Payment from "../components/Payment/Payment";
import PaymentResult from "../components/Payment/PaymentResult";
import ComparePage from "../components/product/ComparePage";
import ProductDetails from "../components/product/ProductDetail ";
import Profile from "../components/Profile/Profile";
import Register from "../components/Profile/Register";
import LayoutDefault from "../layout/LayoutDefault";
import Unauthorized from "../layout/LayoutDefault/Unauthorized";
import Cart from "../pages/Cart";
import Home from "../pages/Home";
import PromotionList from "../admin/PromotionList";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../components/ForgotPassword/ForgotPassword";
import ResetPassword from "../components/ForgotPassword/ResetPassword";

export const adminRoutes = {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={[1, 3]} />, // Chỉ cho phép admin vào
    children: [
        {
            path: "",
            element: <LayoutAdmin />,
            children: [
                {
                    path: "dashboard",
                    element: <Dashboard />,
                },
                {
                    path: "products/list",
                    element: <ProductList />,
                },
                {
                    path: "products/categories",
                    element: <ProductCategories />,
                },
                {
                    path: "orders",
                    element: <OrderManageMent />,
                },
                {
                    path: "inventory",
                    element: <InventoryManagement />,
                },
                {
                    path: "users",
                    element: <UserManagement />,
                },
                {
                    path: "recycle",
                    element: <RecycleManagement />,
                },
                {
                    path: "promotions",
                    element: <PromotionList />,
                },
                {
                    path: "promotions/vouchers",
                    element: <VoucherManagement />,
                },
                {
                    path: "settings",
                    element: <SystemSettings />,
                },
                {
                    // Mặc định chuyển hướng đến dashboard
                    path: "",
                    element: <Dashboard />,
                },

            ]
        },

    ],
};
export const router = [
    {
        path: "/",
        element: <LayoutDefault />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "cart",
                element: <Cart />
            },
            {
                path: "payment",
                element: <Payment />
            },
            {
                path: "product/:id", // Định tuyến cho trang chi tiết sản phẩm
                element: <ProductDetails />
            },
            {
                path: "/profile", // Định nghĩa /profile ở cấp độ root
                element: <Profile />
            },

            {
                path: "/register", // Thêm định tuyến cho register
                element: <Register />
            },
            {
                path: "/recycling", // Thêm định tuyến cho register
                element: <GreenPhone />
            },
            {
                path: "/announce", // Thêm định tuyến cho register
                element: <Announce />
            },
            {
                path: "/compare", // Thêm định tuyến cho register
                element: <ComparePage />
            },
            {
                path: "/payment-result", // Thêm định tuyến cho register
                element: <PaymentResult />
            },
            {
                path: "/forgot-password", // Thêm định tuyến cho Login
                element: <ForgotPassword />
            },
            {
                path: "/reset-password", // Thêm định tuyến cho Login
                element: <ResetPassword />
            },
        ]
    },
    {
        path: "/login", // Thêm định tuyến cho Login
        element: <Login />
    },

    adminRoutes,
    {
        // Mặc định chuyển hướng đến dashboard
        path: "/unauthorized",
        element: <Unauthorized />,
    },
];
