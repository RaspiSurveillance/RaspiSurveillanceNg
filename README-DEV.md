# RaspiSurveillanceNg

Based on Angular, SCSS, FontAwesome, Bootstrap and more.

## Development server

npm install
npm install -g @angular/cli@latest

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files. Add `--open` to automatically open in browser.

(~/.npm-global/bin/ng serve)

## Requirements

Backend server: RaspiSurveillanceServer: https://github.com/RaspiSurveillance/RaspiSurveillanceServer

### Docker

#### Installation

- Instructions: https://hub.docker.com/editions/community/docker-ce-desktop-windows/

## Build for production

### Build the RaspiSurveillance Angular

- "docker image build -t raspisurveillance-ng -f docker/Dockerfile ."
- "docker login"
- "docker tag raspisurveillance-ng <dockerName>/raspisurveillance-ng:<version>"
- "docker push <dockerName>/raspisurveillance-ng:<version>"
- Change "production: true" in "src/environments/environments.ts" (--prod currently not working...)

## Run the software

Windows: On windows the user has to add the project folder in file sharing in order to activate bind mounting into Docker containers:

- Docker - Settings - Resources - + - Select "/path/to/RaspiSurveillanceNg"

### Local development

#### Backend

- Start via "docker-compose -f docker/stack-dev.yml up"
- Database UI available at http://localhost:8080
- You might want to insert some example data: "resources/database.sql" + "resources/example-data.sql"

#### Frontend

- npm install
- Start frontend via "ng serve"

## Some useful docker commands

### List images

docker images

### Delete an image

docker image remove imgId1[, imgId2, ...]

### List all containers

docker container ls -a

## Run the full software stack on a linux server

### Production

- Change usernames, passwords, API_URL, etc. in "docker/stack.yml"
- Change the nginx configuration at "docker/nginx/nginx.prod.conf" and copy it over to "docker/nginx/nginx.conf" on your server
    - Make sure a reverse proxy is set up (example in nginx.conf), CORS-requests are not allowed in production
- Change the flyway db migration configuration at "docker/flyway/config/flyway.conf" and copy it over to "docker/flyway/config/flyway.conf" on your server
- Generate an ssl certificate for your domain, e.g. via https://letsencrypt.org
    - Install certbot
    - "sudo certbot certonly --standalone -d <yourDomain> -d www.<yourDomain>"
    - "cd /etc/letsencrypt/live/<yourDomain>"
    - "openssl pkcs12 -export -in fullchain.pem -inkey privkey.pem -out springboot_letsencrypt.p12 -name bootalias -CAfile chain.pem -caname root"
- Copy your ssl certificate "fullchain.pem" and "privkey.pem" to "data/certificates"
- Make sure to have the correct permissions for the mounted database folder: "sudo chown -R 1001:1001 data/db/"
- Start via "docker-compose -f docker/stack.yml up"
- Use "docker-compose -f docker/stack.yml up -d" to start in background

### File structure at your server

- stack.yml
- data/certificates/fullchain.pem
- data/certificates/privkey.pem
- docker/nginx/nginx.conf
- docker/nginx/mime.types
- docker/flyway/config/flyway.conf

### Infos

- The database is externalized and writes data to "docker/data/db" so it's not erased on container deletion.

## Stop the software

- Stop docker containers (e.g. "docker-compose -f ./docker/stack-dev.yml stop" or "docker-compose -f ./docker/stack.yml stop")

## More information

Properties and configuration in example files:

* docker/stack-prod.yml
