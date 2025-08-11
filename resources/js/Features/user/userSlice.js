import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: 'user',
    initialState : {},
    reducers: {
        setUser: (state, action) => {
            return {...state, ...action.payload};
        },
        unsetUser: (state) => {
            return {};
        },
        updateUser: (state, action) => {
            return {...state, ...action.payload}
        }
    }
});

export const getUser = (state) => {
    return state.user;
};

export const { setUser, unsetUser, updateUser } = userSlice.actions;

export default userSlice.reducer;
