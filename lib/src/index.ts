import { v4 as uuid } from 'uuid';
import Cookies from 'js-cookie';
import axios from 'axios';

export type KeeptowerOptions = {
  local: boolean;
  debug: boolean;
};

type KeeptowerLogLevels = 'log' | 'warn' | 'error';

type KeeptowerPayload = {
  data: any;
  keeptower_time: string;
  keeptower_user_agent: string;
  keeptower_user_id: string;
  keeptower_level: string;
};

const keeptowerDefaults = {
  cookieName: 'kptr',
  cookieDomain: window.location.hostname,
  cookiePath: '/',
  cookieExpires: 365,
};

export class Keeptower {
  endpoint: string;
  options: KeeptowerOptions;
  userAgent: string;

  constructor(endpoint: string, options: Partial<KeeptowerOptions> = {}) {
    this.endpoint = endpoint;
    this.options = { local: false, debug: false, ...options };
    this.userAgent = navigator.userAgent;
  }

  setup() {
    this.trackConsole();
    if (this.options.debug) {
      this.debugger(
        `[Keeptower] Debug mode: ON\n ${JSON.stringify(this, null, 2)}`
      );
    }
  }

  trackConsole() {
    const oldLog = console.log;
    const oldWarn = console.warn;
    const oldError = console.error;
    console.log = this.sendConsoleCapture(oldLog, 'log');
    console.warn = this.sendConsoleCapture(oldWarn, 'warn');
    console.error = this.sendConsoleCapture(oldError, 'error');
  }

  sendConsoleCapture(oldFunc: any, level: KeeptowerLogLevels) {
    const { local, debug } = this.options;
    return (...args: any) => {
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

  debugger(data: any) {
    console.log(data, { keeptower_debug: true });
  }

  isDebug(args: Record<string, any>) {
    let isDebug = false;
    args.forEach((arg: any) => {
      if (
        typeof arg === 'object' &&
        Object.keys(arg).includes('keeptower_debug')
      ) {
        isDebug = true;
      }
    });
    return isDebug;
  }

  getCookie() {
    let identifier = null;
    const cookie = Cookies.get(keeptowerDefaults.cookieName);
    if (!cookie) {
      identifier = this.setupCookie();
    } else {
      identifier = cookie;
    }
    return identifier;
  }

  setupCookie() {
    const identifier = uuid();
    Cookies.set(keeptowerDefaults.cookieName, identifier, {
      expires: keeptowerDefaults.cookieExpires,
      path: keeptowerDefaults.cookiePath,
      domain: window.location.host,
    });
    return identifier;
  }

  parsePayload(data: any, level: KeeptowerLogLevels) {
    const user_id = this.getCookie();
    const payload: Partial<KeeptowerPayload> = {};
    payload.data = JSON.parse(JSON.stringify(data));
    payload.keeptower_time = new Date().toISOString();
    payload.keeptower_user_agent = this.userAgent;
    payload.keeptower_user_id = user_id;
    payload.keeptower_level = level;
    return data;
  }

  postData(data: any) {
    axios.post(this.endpoint, data).catch(error => {
      this.debugger('[Keeptower]');
      this.debugger(error);
    });
    this.debugger(data);
  }
}
