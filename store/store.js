import { createStore } from "./core.js";
import reducer from "./reducer.js";

const { connect, dispatch, getState } = createStore(reducer);

window.dispatch = dispatch;

export { connect, dispatch, getState };
