import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./App";
import transport from "./transport";
import configureStore from "./configureStore";
import { initialState as initialSettingsState } from "./settings/reducer";
import settingsApi from "./settings/settingsApi";
import { baseUrl } from "./config";
import "./index.css";

const store = configureStore({
  settings: initialSettingsState
});

transport.connect(baseUrl);

settingsApi.init(store);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root") as HTMLElement
);
