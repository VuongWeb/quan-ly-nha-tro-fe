import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginApi, logOutApi } from '~/api/auth.api';
import { IUser } from '~/types/User.type';
export const signIn = createAsyncThunk(
    'auth/login',
    async (user: IUser, thunkAPI) => {
        try {
            const res = await loginApi(user);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);
export const logOut = createAsyncThunk('auth/logOut', async () => {
    try {
        await logOutApi();
        return;
    } catch (error) {
        //
    }
});
const initialState = {
    user: {},
    token: null,
};
export const userSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, payload) => {
            return {
                ...state,
                user: payload,
            };
        },
    },
    extraReducers(builder) {
        builder.addCase(signIn.fulfilled, (state, action) => {
            const { payload } = action;
            const { password, ...user } = payload.user;
            return {
                token: payload.token,
                user: { ...user },
            };
        });
        builder.addCase(logOut.fulfilled, (state, actions) => {
            return initialState;
        });
    },
});

export const { login } = userSlice.actions;
export default userSlice.reducer;
