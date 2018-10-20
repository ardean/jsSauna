import transport from "src/transport";

class SettingsApi {
  baseName: string = "settings";

  init(store) {
    transport.socket
      .on("turnOn", () => {
        store.dispatch({
          type: "SETTINGS_TURN_ON"
        });
      })
      .on("turnOff", () => {
        store.dispatch({
          type: "SETTINGS_TURN_OFF"
        });
      })
      .on("temperatureChange", (temperature: number) => {
        store.dispatch({
          type: "SETTINGS_TEMPERATURE_CHANGE",
          temperature
        });
      })
      .on("humidityChange", (humidity: number) => {
        store.dispatch({
          type: "SETTINGS_HUMIDITY_CHANGE",
          humidity
        });
      })
      .on("targetTemperatureChange", (targetTemperature: number) => {
        store.dispatch({
          type: "SETTINGS_TARGET_TEMPERATURE_CHANGE",
          targetTemperature
        });
      });
  }

  async load() {
    return await transport.call(`${this.baseName}.load`);
  }

  async changeTargetTemperature(targetTemperature: number) {
    return await transport.call(`${this.baseName}.changeTargetTemperature`, targetTemperature);
  }

  async turnOn() {
    return await transport.call(`${this.baseName}.turnOn`);
  }

  async turnOff() {
    return await transport.call(`${this.baseName}.turnOff`);
  }
}

export default new SettingsApi();