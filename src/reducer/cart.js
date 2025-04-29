import { FETCH_CART_SUCCESS } from "../actions/cart";

const initialState = {
    cart: [],
};

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_CART_SUCCESS:
            return {
                ...state,
                cart: action.payload,
            };
        case "ADD_TO_CART":
            if (Array.isArray(state.cart)) {
                const uniqueId = `${action.info.id}-${action.info.color}`;
                const existingItemIndex = state.cart.findIndex(
                    (item) => `${item.info.id}-${item.info.color}` === uniqueId
                );
                if (existingItemIndex >= 0) {
                    return {
                        ...state,
                        cart: state.cart.map((item, index) =>
                            index === existingItemIndex
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    };
                } else {
                    return {
                        ...state,
                        cart: [
                            ...state.cart,
                            {
                                id: uniqueId,
                                info: action.info,
                                quantity: 1,
                            },
                        ],
                    };
                }
            } else {
                // Xử lý trường hợp state.cart không phải là mảng
                console.error("state.cart is not an array:", state.cart);
                return state; // Hoặc trả về một state mới với cart là mảng rỗng
            }
        case "UPDATE_QUANTITY":
            return {
                ...state,
                cart: state.cart.map((item) =>
                    item.id === action.payload.itemId // Sử dụng action.payload.itemId
                        ? { ...item, quantity: action.payload.quantity } // Sử dụng action.payload.quantity
                        : item
                ),
            };
        case "DELETE_ITEM":
            return {
                ...state,
                cart: state.cart.filter((item) => item.id !== action.id), // Action payload là itemId
            };
        case "DELETE_ALL":
            return {
                ...state,
                cart: [],
            };
        default:
            return state;
    }
};

export default cartReducer;