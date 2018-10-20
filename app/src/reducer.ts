import { combineReducers, Reducer } from "redux";
import settingsReducer, { SettingsState } from "./settings/reducer";

export interface AppState {
  settings: SettingsState;
}

const reducer: Reducer<AppState> = combineReducers<AppState>({
  settings: settingsReducer
});

export default reducer;