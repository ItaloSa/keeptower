export type KeeptowerOptions = {
  local: boolean;
  debug: boolean;
}

export class Keeptower {
  endpoint: string;
  options: KeeptowerOptions;
  userAgent: string;

  constructor(endpoint: string, options: Partial<KeeptowerOptions> = {}) {
    this.endpoint = endpoint;
    this.options = { local: false, debug: false , ...options};
    this.userAgent = navigator.userAgent;
  }

  test(data: any) {
    console.log(data);
  }

}
