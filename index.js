import { v4 as uuid } from 'uuid';
import Cookies from 'js-cookie';

export default class Keeptower {
  constructor(options = {}) {
    Object.assign(
      this,
      {
        endpoint: '',
        debug: false,
        local: true,
        cookieName: 'keeptower',
        cookieDomain: window.location.hostname,
        cookiePath: '/',
        cookieExpires: 365,
        fetchOptions: {}
      },
      options
      );
    this.debuggerInstance = null;
    this.userAgent = navigator.userAgent;
  }

  setup() {
    this.trackConsole();
    if (this.debug) {
      this.debugger(`[Keeptower] Debug mode: ON\n ${JSON.stringify(this, null, 2)}`);
    }
  }

  debugger(...args) {
    this.debuggerInstance.apply(console, args);
  }

  trackConsole() {
    const oldLog = console.log;
    const oldWarn = console.warn;
    const oldError = console.error;
    console.log = this.sendConsoleCapture(oldLog, 'log');
    console.warn = this.sendConsoleCapture(oldWarn, 'warn');
    console.error = this.sendConsoleCapture(oldError, 'error');
    this.debuggerInstance = oldLog;
  }

  sendConsoleCapture(oldFunc, level) {
    const { local, debug } = this;
    return (...args) => {
      oldFunc.apply(console, args);
      const [data] = args;
      const payload = this.parsePayload(data);
      if (!local) {
        this.postData(payload);
      } else if (debug) {
        this.debugger(`[Keeptower]\n ${JSON.stringify(payload, null, 2)}`);
      }
    };
  }

  postData(data) {
    fetch(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...this.fetchOptions
    }).catch((error) => {
      this.debugger('[Keeptower]');
      this.debugger(error);
    });
  }

  parsePayload(data) {
    const user_id = this.getCookie();
    data = JSON.parse(JSON.stringify(data));
    data.keeptower_time = new Date().toISOString();
    data.keeptower_user_agent = navigator.userAgent;
    data.keeptower_user_id = user_id;
    return data;
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
}
