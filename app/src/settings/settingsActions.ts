import Settings from "./Settings";
import settingsApi from "./settingsApi";
import { Dispatch } from "redux";

export interface SettingsLoadingAction {
  type: "SETTINGS_LOADING";
}

export interface SettingsLoadAction {
  type: "SETTINGS_LOAD";
  settings: Settings;
}

export interface SettingsTurnOnAction {
  type: "SETTINGS_TURN_ON";
}

export interface SettingsTurnOffAction {
  type: "SETTINGS_TURN_OFF";
}

export interface SettingsTemperatureChangeAction {
  type: "SETTINGS_TEMPERATURE_CHANGE";
  temperature: number;
}

export interface SettingsHumidityChangeAction {
  type: "SETTINGS_HUMIDITY_CHANGE";
  humidity: number;
}

export interface SettingsTargetTemperatureChangeAction {
  type: "SETTINGS_TARGET_TEMPERATURE_CHANGE";
  targetTemperature: number;
}

export interface SettingsChangingTargetTemperatureAction {
  type: "SETTINGS_CHANGING_TARGET_TEMPERATURE";
  targetTemperature: number;
}

export interface SettingsChangedTargetTemperatureAction {
  type: "SETTINGS_CHANGED_TARGET_TEMPERATURE";
  targetTemperature: number;
}

export interface SettingsTurningOnAction {
  type: "SETTINGS_TURNING_ON";
}

export interface SettingsTurnedOnAction {
  type: "SETTINGS_TURNED_ON";
}

export interface SettingsTurningOffAction {
  type: "SETTINGS_TURNING_OFF";
}

export interface SettingsTurnedOffAction {
  type: "SETTINGS_TURNED_OFF";
}

export type SettingsAction =
  SettingsLoadingAction |
  SettingsLoadAction |
  SettingsTurnOnAction |
  SettingsTurnOffAction |
  SettingsTemperatureChangeAction |
  SettingsHumidityChangeAction |
  SettingsTargetTemperatureChangeAction |
  SettingsChangingTargetTemperatureAction |
  SettingsChangedTargetTemperatureAction |
  SettingsTurningOnAction |
  SettingsTurnedOnAction |
  SettingsTurningOffAction |
  SettingsTurnedOffAction;

export const load = () => async (dispatch: Dispatch<SettingsAction>): Promise<SettingsLoadAction> => {
  dispatch({
    type: "SETTINGS_LOADING"
  });

  const settings = await settingsApi.load();

  return await dispatch({
    type: "SETTINGS_LOAD",
    settings
  });
};

export const changeTargetTemperature = (targetTemperature: number) => async (dispatch: Dispatch<SettingsAction>): Promise<SettingsChangedTargetTemperatureAction> => {
  dispatch({
    type: "SETTINGS_CHANGING_TARGET_TEMPERATURE",
    targetTemperature
  });

  await settingsApi.changeTargetTemperature(targetTemperature);

  return await dispatch({
    type: "SETTINGS_CHANGED_TARGET_TEMPERATURE",
    targetTemperature
  });
};

export const turnOn = () => async (dispatch: Dispatch<SettingsAction>): Promise<SettingsTurnedOnAction> => {
  dispatch({
    type: "SETTINGS_TURNING_ON"
  });

  await settingsApi.turnOn();

  return await dispatch({
    type: "SETTINGS_TURNED_ON"
  });
};

export const turnOff = () => async (dispatch: Dispatch<SettingsAction>): Promise<SettingsTurnedOffAction> => {
  dispatch({
    type: "SETTINGS_TURNING_OFF"
  });

  await settingsApi.turnOff();

  return await dispatch({
    type: "SETTINGS_TURNED_OFF"
  });
};