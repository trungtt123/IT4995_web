import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import conversationService from "../Services/Api/conversationService";

export const updateConversation = createAction('updateConversation');
export const getConversation = createAsyncThunk("conversation/conversation", async (data, thunkAPI) => {
    try {
        const { conversationId } = data;
        return await conversationService.getConversation(conversationId);
    } catch (e) {
        console.log("error", e);
        return thunkAPI.rejectWithValue("something went wrong");
    }
});

const initialState = {
    conversationData: null
};

const conversationSlice = createSlice({
    name: "conversation",
    initialState,
    reducers: {},
    extraReducers: {
        [updateConversation]: (state, action) => {
            state.conversationData = action?.payload;
        },
        [getConversation.fulfilled]: (state, action) => {
            state.conversationData = action.payload.data;
            console.log('getConversation payload', action);
        },
        [getConversation.rejected]: (state, action) => {
            console.log('getConversation rejected');
            state.conversationData = null;
        },
    },
});

export default conversationSlice.reducer;
