import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch hub data
export const fetchHubData = createAsyncThunk(
  'hub/fetchHubData',
  async ({ userId, getRaspDataByUserId }, { rejectWithValue }) => {
    try {
      const response = await getRaspDataByUserId(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Activate hub and fetch updated data
export const activateHubThunk = createAsyncThunk(
  'hub/activateHub',
  async ({ code, userId, activateHub, getRaspDataByUserId }, { dispatch, rejectWithValue }) => {
    try {
      await activateHub(code, userId);
      await dispatch(fetchHubData({ userId, getRaspDataByUserId }));
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update hub name
export const updateHubNameThunk = createAsyncThunk(
  'hub/updateHubName',
  async ({ hubId, name, updateHubName, userId, getRaspDataByUserId }, { dispatch, rejectWithValue }) => {
    try {
      await updateHubName(hubId, name);
      await dispatch(fetchHubData({ userId, getRaspDataByUserId }));
      return { hubId, name };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  hub: [],
  hubLoading: false,
  hubError: null,
  hubSuccess: null,
};

const hubSlice = createSlice({
  name: 'hub',
  initialState,
  reducers: {
    setHubLoading: (state, action) => {
      state.hubLoading = action.payload;
    },
    clearHubMessages: (state) => {
      state.hubError = null;
      state.hubSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHubData.pending, (state) => {
        state.hubLoading = true;
      })
      .addCase(fetchHubData.fulfilled, (state, action) => {
        state.hubLoading = false;
        state.hub = action.payload;
      })
      .addCase(fetchHubData.rejected, (state, action) => {
        state.hubLoading = false;
        state.hubError = action.payload;
      })
      .addCase(activateHubThunk.pending, (state) => {
        state.hubLoading = true;
      })
      .addCase(activateHubThunk.fulfilled, (state) => {
        state.hubLoading = false;
        state.hubSuccess = 'Hub activated successfully';
      })
      .addCase(activateHubThunk.rejected, (state, action) => {
        state.hubLoading = false;
        state.hubError = action.payload;
      })
      .addCase(updateHubNameThunk.pending, (state) => {
        state.hubLoading = true;
      })
      .addCase(updateHubNameThunk.fulfilled, (state, action) => {
        state.hubLoading = false;
        state.hubSuccess = 'Hub name updated successfully';
      })
      .addCase(updateHubNameThunk.rejected, (state, action) => {
        state.hubLoading = false;
        state.hubError = action.payload;
      });
  },
});

export const { setHubLoading, clearHubMessages } = hubSlice.actions;
export default hubSlice.reducer;
