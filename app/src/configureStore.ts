import { applyMiddleware, createStore, Middleware, Store, compose } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import reducer, { AppState } from "./reducer";
import { dev } from "./config";

let middleware: Middleware[] = [thunk];

if (dev) {
  middleware = [...middleware, logger];
}

export default function configureStore(initialState: AppState): Store<AppState> {
  const win = window as any;
  const composeEnhancers = typeof window === "object" && win.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    win.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) :
    compose;
  const enhancer = composeEnhancers(
    applyMiddleware(...middleware)
  );

  return createStore(
    reducer,
    initialState,
    enhancer
  );
}