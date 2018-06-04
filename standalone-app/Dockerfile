# Build the project and start the standalone application

FROM kkarczmarczyk/node-yarn:latest
USER root
RUN useradd -m depgraph
ADD --chown=depgraph . /home/depgraph/npm-dependency-graph

USER depgraph
WORKDIR /home/depgraph/npm-dependency-graph
RUN yarn install

EXPOSE 3001
CMD cd standalone-app && yarn start
