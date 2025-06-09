const Hapi = require('@hapi/hapi');
const advancedRecommendRoute = require('./routes/advanced-recommend-route');
const getMoodsRoute = require('./routes/get-moods-route');
const getMovieDetailRoute = require('./routes/get-movie-detail-route');
const authRoute = require('./routes/auth-route');
const commentRoute = require('./routes/comment-route');
const { authPlugin } = require('./services/auth-service');

const cors = require('cors');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: { cors: { origin: ['*'] } }
  });

  await server.register(authPlugin);

  try {
    server.route(getMoodsRoute);
    server.route(advancedRecommendRoute);
    server.route(getMovieDetailRoute);
    server.route(authRoute);
    server.route(commentRoute);

    await server.start();
    console.log('Server running on %s', server.info.uri);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();