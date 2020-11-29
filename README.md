# Keeptower

Minimal console tracker 

## Usage
> Works only with ES6. 

```javascript
import Keeptower from 'keeptower';

const keeptower = new Keeptower({
  endpoint: 'https://your-awesome.api/track'
});
keeptower.setup();
```

### Options

| Option              |                                                                                                                                                  | Default                    |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| endpoint (required) | A string indicating a valid URL where Keeptower will send the data. It must accept the `POST` HTTP method.                                       | -                          |
| debug               | A boolean that set the debug mode on or off. If `true`, all settings will be logged at the console.                                              | `false`                    |
| local               | A boolean indicating if the application is in development or production environment. If `false` the captured data won't be sent to the endpoint. | `true`                     |
| cookieName          | A string indicating the name witch the cookie will be registered.                                                                                | `'keeptower'`              |
| cookieDomain        | A string indicating a valid domain where the cookie should be visible. The cookie will also be visible to all subdomains.                        | `window.location.hostname` |
| cookiePath          | A string the path where the cookie is visible.                                                                                                   | `'/'`                      |
| cookieExpires       | A number that defines the number of days witch the cookie will be valid.                                                                         | `365`                      |
| fetchOptions        | Please refer [Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) to know more.                                   | `{}`                       |

