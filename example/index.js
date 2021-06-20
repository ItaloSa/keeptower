import { Keeptower } from '../lib/dist';

const keeptower = new Keeptower('aaa', { debug: true, local: true });
keeptower.setup();

console.log('log normal aq');
