// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://2e96655affaae7c258c8db3ae6f3621c@o4511759593373696.ingest.us.sentry.io/4511759594618880",

   integrations:[
      Sentry.vercelAIIntegration({
        recordInputs:true,
        recordOutputs:true,
      }),
      Sentry.consoleLoggingIntegration({levels:["log","warn","error"]})
    ],
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});
