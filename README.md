![Cynomys](https://raw.githubusercontent.com/marteinn/Cynomys/develop/img/slack-example.png)

# Cynomys

A lightweight website monitor that runs on Serverless/AWS.


## Features

- Supports multiple website endpoints
- Interprets non 200/201 status codes as errors
- Detects network/domain issues
- Reports errors to slack through a webhook


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

Cynomys is released under the [MIT License](http://www.opensource.org/licenses/MIT).
