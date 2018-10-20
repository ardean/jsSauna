import { SettingsAction } from "./settingsActions";
import Settings from "./Settings";

export interface SettingsState {
  settings: Settings | null;
}

export const initialState: SettingsState = {
  settings: null
};

export default function reducer(state: SettingsState = initialState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case "SETTINGS_LOAD":
      return {
        ...state,
        settings: action.settings
      };

    case "SETTINGS_TURN_ON":
      return {
        ...state,
        settings: {
          ...state.settings,
          on: true
        }
      };

    case "SETTINGS_TURN_OFF":
      return {
        ...state,
        settings: {
          ...state.settings,
          on: false
        }
      };

    case "SETTINGS_TEMPERATURE_CHANGE":
      return {
        ...state,
        settings: {
          ...state.settings,
          temperature: action.temperature
        }
      };

    case "SETTINGS_HUMIDITY_CHANGE":
      return {
        ...state,
        settings: {
          ...state.settings,
          humidity: action.humidity
        }
      };

    case "SETTINGS_TARGET_TEMPERATURE_CHANGE":
    case "SETTINGS_CHANGING_TARGET_TEMPERATURE":
      return {
        ...state,
        settings: {
          ...state.settings,
          targetTemperature: action.targetTemperature
        }
      };

    default:
      return state;
  }
}