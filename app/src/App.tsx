import * as React from "react";
import { connect } from "react-redux";
import * as settingsActions from "./settings/settingsActions";
import LoadingIndicator from "./components/LoadingIndicator";
import ErrorModal from "./components/ErrorModal";
import Login from "./components/Login";
import SaunaControl from "./components/SaunaControl";
import { AppState } from "./reducer";
import Settings from "./settings/Settings";

interface Props {
  settings: Settings;
  loadSettings();
}

class App extends React.Component<Props> {
  componentDidMount() {
    this.props.loadSettings();
  }

  render() {
    const { settings } = this.props;
    if (!settings) return <LoadingIndicator />;
    // return <ErrorModal />;
    // return <Login />;
    return <SaunaControl settings={settings} />;
  }
}

const mapStateToProps = (state: AppState) => ({
  settings: state.settings.settings
});

const mapDispatchToProps = (dispatch) => ({
  loadSettings: () => dispatch(settingsActions.load())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);