FROM gitpod/workspace-full:latest

USER root
RUN apt-get update \
    && apt-get install -y libx11-dev libxkbfile-dev \
    && apt-get clean

USER gitpod
RUN bash -c ". .nvm/nvm.sh \
    && nvm install 10 \
    && nvm use 10 \
    && npm install -g yarn"

USER root
