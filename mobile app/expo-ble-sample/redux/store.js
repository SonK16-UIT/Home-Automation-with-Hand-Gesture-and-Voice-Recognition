import { configureStore } from "@reduxjs/toolkit";

import hubReducer from "./slices/hub";
import imageReducer from "./slices/image";
import deviceReducer from "./slices/device";
import actionsReducer from "./slices/actions";

export const store = configureStore({
    reducer: {
        hub: hubReducer,
        image: imageReducer,
        device: deviceReducer,
        actions: actionsReducer,
    },
});
