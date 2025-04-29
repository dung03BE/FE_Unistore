import { ADD_TO_COMPARE, REMOVE_ALL_FROM_COMPARE, REMOVE_FROM_COMPARE } from "../actions/compare";


const initialState = {
    compareList: [],
};

const compareReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_TO_COMPARE:
            if (!state.compareList.includes(action.payload)) {
                return {
                    ...state,
                    compareList: [...state.compareList, action.payload],
                };
            }
            return state;
        case REMOVE_FROM_COMPARE:
            return {
                ...state,
                compareList: state.compareList.filter(id => id !== action.payload),
            };
        case REMOVE_ALL_FROM_COMPARE:  // Thêm case này
            return {
                ...state,
                compareList: [],
            };
        default:
            return state;
    }
};

export default compareReducer;