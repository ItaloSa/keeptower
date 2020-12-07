import { v4 as uuid } from "uuid";
import Cookies from "js-cookie";

export default class Keeptower {
  constructor(options = {}) {
    Object.assign(
      this,
      {
        endpoint: "",
        debug: false,
        local: true,
        cookieName: "keeptower",
        cookieDomain: window.location.hostname,
        cookiePath: "/",
        cookieExpires: 365,
        fetchOptions: {}
      },
      options
    );
    this.userAgent = navigator.userAgent;
  }

  setup() {
    this.trackConsole();
    if (this.debug) {
      this.debugger(
        `[Keeptower] Debug mode: ON\n ${JSON.stringify(this, null, 2)}`,
        { debug: true }
      );
    }
  }

  debugger(data) {
    console.log(data, { keeptower_debug: true });
  }

  trackConsole() {
    const oldLog = console.log;
    const oldWarn = console.warn;
    const oldError = console.error;
    console.log = this.sendConsoleCapture(oldLog, "log");
    console.warn = this.sendConsoleCapture(oldWarn, "warn");
    console.error = this.sendConsoleCapture(oldError, "error");
  }

  sendConsoleCapture(oldFunc, level) {
    const { local, debug } = this;
    return (...args) => {
      oldFunc.apply(console, args);
      if (this.isDebug(args)) {
        return;
      }
      const [data] = args;
      const payload = this.parsePayload(data, level);
      if (!local) {
        this.postData(payload);
      } else if (debug) {
        this.debugger(`[Keeptower]\n ${JSON.stringify(payload, null, 2)}`);
      }
    };
  }

  postData(data) {
    fetch(this.endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...this.fetchOptions
    }).catch((error) => {
      this.debugger("[Keeptower]");
      this.debugger(error);
    });
  }

  parsePayload(data, level) {
    const user_id = this.getCookie();
    const payload = {};
    payload.data = JSON.parse(JSON.stringify(data));
    payload.keeptower_time = new Date().toISOString();
    payload.keeptower_user_agent = navigator.userAgent;
    payload.keeptower_user_id = user_id;
    payload.keeptower_level = level;
    return payload;
  }

  setupCookie() {
    const identifier = uuid();
    Cookies.set(this.cookieName, identifier, {
      expires: this.cookieExpires,
      path: this.cookiePath,
      domain: this.cookieHost
    });
    return identifier;
  }

  getCookie() {
    let identifier = null;
    const cookie = Cookies.get(this.cookieName);
    if (!cookie) {
      identifier = this.setupCookie();
    } else {
      identifier = cookie;
    }
    return identifier;
  }

  isDebug(args) {
    let isDebug = false;
    args.forEach((arg) => {
      if (typeof arg === "object" && Object.keys(arg).includes("keeptower_debug")) {
        isDebug = true;
      }
    });
    return isDebug;
  }
}
