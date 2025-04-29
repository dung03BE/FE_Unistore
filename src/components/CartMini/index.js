// Trong components/CartMini.js
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function CartMini() {
    const cart = useSelector((state) => state.cartReducer.cart); // Sửa ở đây

    const total = Array.isArray(cart)
        ? cart.reduce((sum, item) => sum + item.quantity, 0)
        : 0;
    console.log("Cart1", cart);
    console.log("tt", total);
    return (
        <>
            <Link to="cart">Giỏ hàng{total > 0 ? `(${total})` : ""}</Link>
        </>
    );
}

export default CartMini;