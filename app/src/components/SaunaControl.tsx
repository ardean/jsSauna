import * as React from "react";
import Settings from "../settings/Settings";
import * as settingsActions from "../settings/settingsActions";
import { connect } from "react-redux";

interface Props {
  settings: Settings;
  changeTargetTemperature(targetTemperature: number): Promise<void>;
  turnOn(): Promise<void>;
  turnOff(): Promise<void>;
}

class SaunaControl extends React.Component<Props> {
  render() {
    const { settings } = this.props;
    const { targetTemperature } = settings;
    if (!settings) return null;
    if (typeof targetTemperature === "undefined") return null;

    return (
      <div className="container main">
        <h1>jsSauna</h1>
        <div className="row">
          <input type="checkbox"
            className="is-sauna-on"
            id="is-sauna-on"
            onChange={this.onChangeOnOff}
            checked={settings.on} />
          <label htmlFor="is-sauna-on">On / Off</label>
        </div>
        <div className="row">
          <div className="current-target-temperature">{targetTemperature}°C</div>
          <input type="range"
            min="0" max={settings.maxTemperature}
            onChange={this.onTargetTemperatureChange}
            className="target-temperature-range"
            value={targetTemperature.toString()} />
        </div>
        <div className="info">
          <div className="row">
            <div className="secondary">Temperature</div>
            <div className="current-temperature">{settings.temperature}°C</div>
          </div>
          <div className="row">
            <div className="secondary">Humidity</div>
            <div className="current-humidity">{settings.humidity}%</div>
          </div>
        </div>
      </div>
    );
  }

  onTargetTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.changeTargetTemperature(parseFloat(e.currentTarget.value));
  }

  onChangeOnOff = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.currentTarget.checked) {
      this.props.turnOff();
    } else {
      this.props.turnOn();
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  changeTargetTemperature: (targetTemperature: number) => dispatch(settingsActions.changeTargetTemperature(targetTemperature)),
  turnOn: () => dispatch(settingsActions.turnOn()),
  turnOff: () => dispatch(settingsActions.turnOff())
});

export default connect(
  null,
  mapDispatchToProps
)(SaunaControl);