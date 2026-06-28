import { BrowserRuntime } from './packages/browser-runtime/src/BrowserRuntime';
(async () => { const rt = new BrowserRuntime('test-trace-123'); await rt.launch(); await rt.navigate('http://example.com'); console.log('Events:', rt.getEvents().length); await rt.shutdown(); console.log('Success'); })();
