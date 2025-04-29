// reducers/user.js
const initialState = {
    userDetails: null,
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USER_DETAILS':
            return {
                ...state,
                userDetails: action.payload,
            };

        default:
            return state;
    }
};

export default userReducer;