const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('swagger/swagger.json');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const { sendSentryNotification } = require('utilities/helpers/sentryHelper');

const { routes } = require('routes');

const app = express();
const { createNamespace } = require('cls-hooked');

Sentry.init({
  environment: process.env.NODE_ENV,
  dsn: process.env.SENTRY_DNS,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],
});
process.on('unhandledRejection', (error) => {
  sendSentryNotification();
  Sentry.captureException(error);
});

const session = createNamespace('request-session');
const job = require('jobs/sendToChain');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  session.run(() => next());
});
app.use(Sentry.Handlers.requestHandler({ request: true, user: true }));

app.use('/', routes);
app.use('/objects-bot/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture 500 errors
    if (error.status >= 500 || !error.status) {
      sendSentryNotification();
      return true;
    }
    return false;
  },
}));

app.use((req, res, next) => {
  session.set('access-token', req.headers['access-token']);
  session.set('waivio-auth', Boolean(req.headers['waivio-auth']));
  next();
});

app.use((req, res, next) => {
  res.status(res.result.status || 200).json(res.result.json);
});

app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500).json({ message: err.message });
});
if (process.env.NODE_ENV !== 'test') {
  job.runPosts();
  job.runComments();
  job.runReviews();
}

module.exports = app;
