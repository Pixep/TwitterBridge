FROM ubuntu:16.04

# Install nodejs 'gify' package dependencies
RUN apt-get -qq update && apt-get -qq -y install \
    curl \
    ffmpeg \
    graphicsmagick

RUN ffmpeg -version

# Manually install nodejs 6.x
RUN cd /tmp
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs
RUN npm --version

# Install our application
RUN mkdir /var/www
COPY \
    index.js \
    package.json \
    *.sh \
    /var/www/
COPY libs /var/www/libs
COPY spec /var/www/spec

RUN cd /var/www && npm install

#CMD ["/var/www/startNode.sh"]
CMD ["/bin/bash"]
