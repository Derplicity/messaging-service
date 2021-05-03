module.exports = {
  development: require('./env/development'),
  test: require('./env/test'),
  production: require('./env/production'),
}[process.env.NODE_ENV || 'development'];
