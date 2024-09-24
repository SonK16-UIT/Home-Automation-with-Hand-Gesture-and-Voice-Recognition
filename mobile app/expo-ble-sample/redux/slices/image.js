import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

  export const readImage = createAsyncThunk(
    "image/readImage",
    async ({ userId,GetImage }, { rejectWithValue }) => {
      try {
        const response = await GetImage(userId);
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.msg);
        }
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  export const updateImage = createAsyncThunk(
    "image/updateImage",
    async ({ image, userId, UploadImage, GetImage }, { dispatch, rejectWithValue }) => {
      try {
        // Upload the image
        const uploadResult = await UploadImage(image, userId);
        
        // Ensure that uploadResult returns an object with a 'success' property
        if (!uploadResult.success) {
          throw new Error(uploadResult.msg);
        }
  
        console.log("Image uploaded successfully. URL:", uploadResult.url);
  
        // Fetch the updated image URL
        const imageInfo = await dispatch(readImage({ userId, GetImage })).unwrap();
        console.log("Retrieved image URL: ", imageInfo);
  
        return imageInfo; // Return the fetched image URL
      } catch (err) {
        console.error("Error during image update:", err);
        return rejectWithValue(err.message);
      }
    }
  );

  const imageSlice = createSlice({
    name: "image",
    initialState: {
      imageUrl: null,
      loading: false,
      error: null,
    },
    reducers: {
      resetImageState: (state) => {
        state.imageUrl = null;
        state.loading = false;
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        // Update Image
        .addCase(updateImage.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateImage.fulfilled, (state, action) => {
          state.loading = false;
          state.imageUrl = action.payload;
        })
        .addCase(updateImage.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
  
        // Get Image
        .addCase(readImage.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(readImage.fulfilled, (state, action) => {
          state.loading = false;
          state.imageUrl = action.payload;
        })
        .addCase(readImage.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
  
  export const { resetImageState } = imageSlice.actions;
  
  export default imageSlice.reducer;