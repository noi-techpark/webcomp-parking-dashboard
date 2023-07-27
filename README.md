<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: CC0-1.0
-->

# Parking dashboard webcomponent

Simple webcomponent showing the real time avaiability for specific parking lots of the Open Data Hub. 


**Table of Contents**
- [Parking dashboard webcomponent](#parking-dashboard-webcomponent)
  - [Prerequisites](#prerequisites)
  - [Installing Docker](#installing-docker)
    - [The docker containers](#the-docker-containers)
      - [START:](#start)
    - [License](#license)
    - [Support](#support)
    - [REUSE](#reuse)

## Prerequisites
To build the project, the following must have been installed in your local machine:
- Node 20
- [Docker]

## Installing Docker
[Video guide: What is Docker?](https://vimeo.com/734001110) <br>
Now that you have the single js file created by the webpack you can use docker to run the file and see the resulting webcomp on docker. But first you'll have to install it.<br>
Install [Docker](https://docs.docker.com/install/) (with Docker Compose) locally on your machine.

### The docker containers
In the file `docker-compose.yml` you can see all the containers that will open on docker:<br>
The first one called: `app` is the one that will show your webcomponent, all the other below are the necessary container for the open data hub Webcomponent store.
These containers are there for the last step of testing if your new webcomp will be visible in the store.<br>
#### START:
- Create a .env file: <br>
  `cp .env.example .env`
- [Optional] Adjust port numbers in .env if they have conflicts with services already running on your machine
- Start the store with: <br>
  `docker-compose up -d`
- Update the docker using the scripts commands of the webpack<br>
ex :  `npm run build`
    > This command in our example will re-bundle your files and update the view on docker
- Wait until the containers are running. You can check the current state with: <br>
  `docker-compose logs --tail 500 -f`
- Access webcomponent running in separated docker in your browser on: <br>
  `localhost:8998`
- Access the store in your browser on: <br>
  `localhost:8999`

Note: If you only want to start the webcomponent in the separated docker container without the webcomponent store, simply run `docker-compose up app -d`


### License
image: "wcs-logo.png" is under the CCO License (public domain)

### Support
For support, please contact [help@opendatahub.com](mailto:help@opendatahub.com).

### REUSE

This project is [REUSE](https://reuse.software) compliant, more information about the usage of REUSE in NOI Techpark repositories can be found [here](https://github.com/noi-techpark/odh-docs/wiki/Guidelines-for-developers-and-licenses#guidelines-for-contributors-and-new-developers).

Since the CI for this project checks for REUSE compliance you might find it useful to use a pre-commit hook checking for REUSE compliance locally. The [pre-commit-config](.pre-commit-config.yaml) file in the repository root is already configured to check for REUSE compliance with help of the [pre-commit](https://pre-commit.com) tool.

Install the tool by running:
```bash
pip install pre-commit
```
Then install the pre-commit hook via the config file by running:
```bash
pre-commit install
```

