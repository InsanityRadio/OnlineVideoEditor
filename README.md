
# OnlineVideoEditor

## Prototypes

### Ingest/Import
The ingest/import engine runs wholly inside Docker. It should be built through `docker-compose`.

1. Install Docker and `docker-compose`.
	- The Docker documentation provides a great README explaining how to install Docker on a variety of systems https://docs.docker.com/install/linux/docker-ce/ubuntu/#set-up-the-repository
	- `docker-compose` can be installed by pulling its script to somewhere in your path. For instance: ```sudo curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose; sudo chmod +x /usr/local/bin/docker-compose```
2. Clone this repository or download a tarball.
3. Edit `docker/ingest/docker-compose.yml` and change `PULL_URL` to point to some RTMP video server. Behind the campus-firewall, one can use the server available at `rtmp://134.219.88.222:1935/falcon/video`. Otherwise, comment out the line and uncomment the lines at the bottom of the file under the `ffmpeg` branch. 
4. Enter the `docker` directory and run `./build.sh`. This will build and launch all the given containers. Be careful, as Docker will automatically restart these containers on launch. 
5. You are now able to access the ingest/import system on the port 1965. 


To remove, run `./remove.sh`. Alternatively, run `scrub.sh` to obliterate the containers entirely, including their persistent volumes.  

### frontend
The frontend can be run from the `frontend/` directory within the project tarball. To build this, you need a working and modern install of Node.js.

1. Install Node.js (10+ minimum, 11 recommended) through the instructions provided by the vendor (for instance, https://nodejs.org/en/download/package-manager/). 
2. Enter the `frontend/` directory and install our build dependencies. These are done by running `npm install`.
3. You can launch and run the development web server by running `npm start`. On some machines, this will automatically spawn a web browser. 

### ffmpeg render scripts
These scripts can be run on any environment with a sane ffmpeg install. By sane, we mean with a reasonable collection of 'non-free' codec packages (at minimum, x264, mpeg2 and AAC). 

#### ./topandtail.sh
This script provides a way to add an intro and extro (think title card and credits) to a video. The videos have their duration calculated, and then some basic maths determines when the video crossover should occur. This allows the main/sandwiched video to be cued before the first audio clip finishes, meaning for a smoother "cross-fade" type transition. 

