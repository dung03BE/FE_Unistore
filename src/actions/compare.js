export const ADD_TO_COMPARE = 'ADD_TO_COMPARE';
export const REMOVE_FROM_COMPARE = 'REMOVE_FROM_COMPARE';
export const REMOVE_ALL_FROM_COMPARE = 'REMOVE_ALL_FROM_COMPARE';

export const addToCompare = (productId) => {
    return {
        type: ADD_TO_COMPARE,
        payload: productId,
    };
};

export const removeFromCompare = (productId) => {
    return {
        type: REMOVE_FROM_COMPARE,
        payload: productId,
    };
};
export const removeAllFromCompare = () => {
    return {
        type: REMOVE_ALL_FROM_COMPARE,
    };
};