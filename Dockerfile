FROM node:18.20.2

RUN git clone https://github.com/project-sekai-ctf/sekai.team /app

WORKDIR /app

RUN chown -R node:node /app

USER node

RUN npm i

RUN npx next build

EXPOSE 3000

ENTRYPOINT [ "npx", "next", "start" ]