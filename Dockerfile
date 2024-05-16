FROM node:18.20.2

RUN git clone https://github.com/project-sekai-ctf/sekai.team /app

WORKDIR /app

RUN npm i

RUN npx next build

RUN chown node:node /app

EXPOSE 3000

USER node

ENTRYPOINT [ "npx", "next", "start" ]