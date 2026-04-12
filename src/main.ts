import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Some browser-side dependencies (for example sockjs-client) still expect a Node-style `global` symbol.
// Provide a safe alias before the app and lazy-loaded chat bundle run.
(globalThis as any).global ??= globalThis;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
