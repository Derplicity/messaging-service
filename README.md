# Messaging Service

The Messaging Service provides private and group messaging between clients.

## Installation

Use [git](https://git-scm.com/) to clone this service:

```bash
git clone [REPOSITORY_URL]
```

## Usage

```bash
cd messaging            # Move into messaging directory
yarn install            # Install dependencies

yarn test               # Run the tests for the service
yarn test:unit          # Run the unit tests
yarn test:integration   # Run the integration tests

yarn coverage           # Generate test coverage reports

yarn start              # Start messaging service in production mode
yarn start:dev          # Start messaging service in development mode
```

## Documentation

> only available in development mode

- REST API: `http://localhost:{PORT}/api/rest`
- WebSocket API: `http://localhost:{PORT}/api/event-driven`

## Tooling

#### Source

- [express](https://expressjs.com/) - Server + REST API
- [socket.io](https://socket.io/) - Event-Driven API
- [mongoose](https://mongoosejs.com/) - Database

#### Testing

- [mocha](https://mochajs.org/) - Test Runner
- [chai](https://www.chaijs.com/) - Assertion Library
- [sinon](https://sinonjs.org/) - Spy/Stub/Mock Library
- [nyc (istanbul)](https://istanbul.js.org/) - Coverage

## License

[MIT](https://choosealicense.com/licenses/mit/)
