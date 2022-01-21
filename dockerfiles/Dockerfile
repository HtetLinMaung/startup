FROM docker:20.10.12-alpine3.15

RUN apk add bash
RUN apk update
RUN apk add git
RUN apk add curl

SHELL ["/bin/bash", "--login", "-c"]

RUN apk add --update nodejs npm

RUN node -v

