import { createSlice } from "@reduxjs/toolkit";

export const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: [],
    reducers: {
        setNotifications(state, action){
            return action.payload;
        },
        addNotification(state, action){
            state.push(action.payload);
        },
        removeNotification(state, action){
            return state.filter(notification => notification.id !== action.payload);
        }
    }
});

export const { setNotifications, addNotification, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
