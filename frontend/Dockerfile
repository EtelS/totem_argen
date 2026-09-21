FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Modo dev (vite) para el esqueleto local. Para produccion: `npm run build`
# + servir /dist con nginx (ver TODO en README.md).
CMD ["npm", "run", "dev"]
