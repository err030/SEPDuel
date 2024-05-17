FROM node:20 as Build
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
COPY --from=build /frontend/dist/untitled2/browser /usr/share/nginx/html
EXPOSE 80
