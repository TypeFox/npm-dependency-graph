# Build the project and start the standalone application

FROM node:10.15.3
USER root
RUN apt-get update && \
    apt-get install -y libx11-dev libxkbfile-dev
RUN npm i -g yarn
RUN useradd -m depgraph
ADD --chown=depgraph . /home/depgraph/npm-dependency-graph

USER depgraph
WORKDIR /home/depgraph/npm-dependency-graph
RUN yarn install

EXPOSE 3001
CMD cd standalone-app && yarn start
