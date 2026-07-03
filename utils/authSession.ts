import { persistor, resetReduxState } from "@/redux/store";
import type { AppDispatch } from "@/redux/store";

export const clearLocalSession = async (dispatch: AppDispatch) => {
  dispatch(resetReduxState());
  await persistor.flush();
  await persistor.purge();
};
