import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching actions based on action ID
export const GetActionsThunk = createAsyncThunk(
  'actions/getActions',
  async ({ actionId, GetActions }, { rejectWithValue }) => {
    try {
      // Fetch actions from Firebase
      const response = await GetActions(actionId);
        return response.result; // Return the structured scenario with actions
    } catch (error) {
      console.error("Error fetching actions:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating an action
export const CreateActionThunk = createAsyncThunk(
  'actions/createAction',
  async ({ actionId, status, deviceName, CreateAction, getScenarioWithActionID }, { rejectWithValue }) => {
    try {
      const response = await CreateAction(actionId, status, deviceName);
      if (response.success) {
        return response.data; // Return the created action data
      } else {
        return rejectWithValue(response.message || 'Failed to create action');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting an action
export const DeleteActionThunk = createAsyncThunk(
  'actions/deleteAction',
  async ({ actionId, index, DeleteAction }, { rejectWithValue }) => {
    try {
      const response = await DeleteAction(actionId, index);
      if (response.success) {
        return index; // Return the index of the deleted action
      } else {
        return rejectWithValue(response.message || 'Failed to delete action');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating an action
export const UpdateActionThunk = createAsyncThunk(
  'actions/updateAction',
  async ({ actionId, hubID, index, deviceName, status, UpdateAction }, { rejectWithValue }) => {
    try {
      const response = await UpdateAction(actionId, hubID, index, deviceName, status);
      if (response.success) {
        return { index, status }; // Return the index and new status of the updated action
      } else {
        return rejectWithValue(response.message || 'Failed to update action');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the actions slice
const actionsSlice = createSlice({
  name: 'actions',
  initialState: {
    actions: [], // Store actions here
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle GetActionsThunk cases
      .addCase(GetActionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetActionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.actions = action.payload; // Set the fetched actions to the state
      })
      .addCase(GetActionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle CreateActionThunk cases
      .addCase(CreateActionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(CreateActionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.actions.push(action.payload); // Add the new action to the state
      })
      .addCase(CreateActionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle DeleteActionThunk cases
      .addCase(DeleteActionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteActionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.actions.splice(action.payload, 1); // Remove the action at the given index
      })
      .addCase(DeleteActionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle UpdateActionThunk cases
      .addCase(UpdateActionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateActionThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { index, status } = action.payload;
        if (state.actions[index]) {
          state.actions[index].action = status; // Update the status of the action at the given index
        }
      })
      .addCase(UpdateActionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default actionsSlice.reducer;
