FROM ubuntu:20.04

# locale
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y locales && \
    sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8
ENV LANG en_US.UTF-8  
ENV LANGUAGE en_US:en  
ENV LC_ALL en_US.UTF-8

# install python
RUN DEBIAN_FRONTEND=noninteractive apt update && \
    DEBIAN_FRONTEND=noninteractive apt -y install python3 python3-pip

# install fonts
ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Berlin
RUN DEBIAN_FRONTEND=noninteractive echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections && \
    apt -y install ttf-mscorefonts-installer

# google chrome
RUN DEBIAN_FRONTEND=noninteractive apt update && \
    apt -y install wget && \
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt -y install ./google-chrome-stable_current_amd64.deb

# chromium via snap
# ubuntu offers chromium only via snap
# not working because using snap inside docker is not supported
#RUN DEBIAN_FRONTEND=noninteractive apt update && apt -y install snap snapd
#RUN DEBIAN_FRONTEND=noninteractive apt update && apt -y install chromium-browser
#RUN snap install chromium

# pgmagick for python
RUN DEBIAN_FRONTEND=noninteractive apt update && \
    apt install -y libgraphicsmagick++1-dev libboost-python-dev && \
    pip3 install pgmagick

# python packages
RUN pip3 install requests websocket markdown2 jsonschema websocket-client fontTools beautifulsoup4 cssutils openpyxl unidecode xmltodict semver pypdf2 reportlab flask

# start
WORKDIR /app
EXPOSE 80
CMD sh /app/start.sh

# TODO:
# pip install via requirements
