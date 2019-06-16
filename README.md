# Serverless-Node-Dynamodb-Boilerplate

This is Node.js based serverless api boilerplate with built in dynamodb support


## Features

- [Serverless](https://serverless.com/)
- Node.js
- Dynamodb support
- Offline support (using [serverless-offline](https://www.npmjs.com/package/serverless-offline) and docker)
- Example endpoints
- Circleci integration
- Secret management


## Requirements

- Node 8.10.0
- Serverless


## Installation

1. `npm install -g serverless`
2. `make setup`
3. `cp example.env .env`


## Developing locally

1. `docker-compose up -d`
1. `cd src`
1. `env $(cat .env | xargs) npm run start`
1. `open http://localhost:3000`


## Handling secrets

Secrets are stored in a encrypted external file, where $KEY is your encryption key.

- Encrypt `openssl aes-256-cbc -e -in .circlerc -out .circlerc-crypt -k $KEY`
- Decrypt `openssl aes-256-cbc -d -in .circlerc-crypt -out .circlerc -k $KEY`


## Versioning

This boilerplate uses [semantic versioning](http://semver.org/).


## Contributing

Want to contribute? Awesome. Just send a pull request.


## License

Serverless-Node-Dynamodb-Boilerplate is released under the [MIT License](http://www.opensource.org/licenses/MIT).
