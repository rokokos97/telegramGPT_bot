build:
	docker build --platform linux/amd64 -t rokokos97/telebot .

run:
	docker run -d -p 3000:3000 --name telebot --rm rokokos97/telebot
