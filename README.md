# Online Video Editor v1.0

Online Video Editor is a platform for creating video clips for social media, from a broadcast stream.

## Technical Description

OVE exists as a series of Docker containers. There are three different components - you can install these on one system, or split these components across systems: the ingest engine, the API, and the worker. 

### Ingest Engine

Configure the ingest engine (`docker/ingest/docker-compose.yml`) to pull your station's RTMP feed. The engine will store the previous 12 hours of broadcast content for creating social media clips. 

### Worker Engine

The worker engine handles video rendering and egress network access (e.g. uploading to social platforms), and when active will use a large percentage of CPU. You can limit this through Docker configuration, or by running the worker engine on a different server. 

### Main API

The main API component runs the application itself, and handles all HTTP routing between the other components. 

## Installation

#### 1. Install a recent version of Docker CE on the host server

#### 2. Clone the Online Video Editor repository.

#### 3. This step can be skipped if using a pre-existing ingest/import component, such as the one provided for convenience below. 

Open `docker/docker-compose.yml`.

Edit PULL_URL to point to the address of a RTMP server we will use for testing. To test without a RTMP server, comment this line and uncomment “ffmpeg” block. 

To change port number, find `1965:80` line under nginx, and change `1965` to target port number for the ingest service to bind to. To bind to a specific network interface, we can specify a triple such as `10.32.2.30:1965:80`. Please note that, even though you can bind to a localhost interface, it will not be accessible to the Docker container we are creating below, due to Docker networking limitations.

#### 4. Open `api/docker-compose.yml`. Edit INGEST_URI to point to the network address of the web server (in our above example, `http://my-real-host-ip:1965`)   

As above, one can specify a port number by finding the line `1964:80` under nginx. 

#### 5. Open `config.yml` and fill in appropriate values. The secret key can be any string of alphanumeric characters of at least 64 characters length. Also, change `public_uri` under the ingest heading to the value we specified above (as `INGEST_URI`). 

#### 6. `cd docker`, run `./build.sh`. If you're only building one component, change directory to its individual directory and build the `docker-compose.yml` file.

#### 7. The system will now be running and accessible at `http://localhost:1964`.
