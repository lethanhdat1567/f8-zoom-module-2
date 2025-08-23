export function createStore(reducer, initialState) {
    let state = reducer(initialState, { type: "@@INIT" });
    const listeners = new Set();

    function getState() {
        return state;
    }

    function dispatch(action, ...args) {
        state = reducer(state, action, args);
        listeners.forEach((listener) => listener(state));
    }

    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    // Kết nối vào Web Component
    function connect(selector = (s) => s) {
        return (BaseElement) =>
            class extends BaseElement {
                constructor() {
                    super();
                    this._unsubscribe = null;
                    this.props = selector(state);
                }

                connectedCallback() {
                    this._unsubscribe = subscribe((newState) => {
                        this.props = selector(newState);
                        this.render?.();
                    });

                    super.connectedCallback?.();
                    // this.render?.();
                }

                disconnectedCallback() {
                    this._unsubscribe?.();
                    super.disconnectedCallback?.();
                }
            };
    }

    return { getState, dispatch, connect };
}
