setup:
	git flow init
	ln -nfs $(PWD)/.githooks/bump-version.sh .git/hooks/post-flow-release-start
	ln -nfs $(PWD)/.githooks/bump-version.sh .git/hooks/post-flow-hotfix-start
	npm install -g serverless
	cd src && npm install
	cd src && cp example.env .env

start:
	docker-compose up -d
	cd src && env $(cat .env | xargs) npm run start

fixcode:
	cd src && npm run fixcode
