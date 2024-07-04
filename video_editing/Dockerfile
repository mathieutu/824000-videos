FROM jrottenberg/ffmpeg:4.3.1-ubuntu1804

WORKDIR /app

# Ensures tzinfo doesn't ask for region info.
ENV DEBIAN_FRONTEND noninteractive

# Install basic dependencies and node version manager (nvm)
RUN apt-get update && apt-get install -y \
    dumb-init \
    xvfb \
    curl \
    build-essential \
    libpango1.0-0 \
    libcairo2 \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libfribidi-dev \
    && apt-get clean

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# nvm environment variables
ENV NVM_VERSION 0.37.2
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 16.20.2

# install nvm
# https://github.com/creationix/nvm#install-script
RUN mkdir -p $NVM_DIR \
    && curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v${NVM_VERSION}/install.sh | bash

# install node and npm
RUN bash -c "source ${NVM_DIR}/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default"

# add node and npm to path so the commands are available
ENV NODE_PATH ${NVM_DIR}/v${NODE_VERSION}/lib/node_modules
ENV PATH      ${NVM_DIR}/versions/node/v${NODE_VERSION}/bin:$PATH

# confirm installation
RUN node -v
RUN npm -v

## INSTALL EDITLY
RUN echo "export LD_LIBRARY_PATH=/app/node_modules/canvas/build/Release/" >> /root/.bashrc
ENV LD_LIBRARY_PATH /app/node_modules/canvas/build/Release/

# Install app dependencies
COPY package.json /app/
COPY package-lock.json /app/
RUN npm install

# Add app source
COPY . /app

# Ensure `editly` binary available in container
RUN npm link

ENTRYPOINT ["/usr/bin/dumb-init", "--", "xvfb-run", "--server-args", "-screen 0 1280x1024x24 -ac"]
CMD [ "editly" ]
