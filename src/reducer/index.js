
import { combineReducers } from "redux";
import cartReducer from "./cart";
import userReducer from "./user";
import compareReducer from "./compare";
const allReducers = combineReducers({
    cartReducer,
    userReducer,
    compareReducer
    // theem nhieu reducer
})
export default allReducers;