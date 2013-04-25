SUPERVISOR := ./node_modules/.bin/supervisor

all:
	@make -j browserify styl server

install:
	@npm install

run: server

build:
	@node bin/compileBrowserify
	@node bin/compileStyl

server:
	@$(SUPERVISOR) -q -w controllers,middlewares,app.js app

browserify:
	@$(SUPERVISOR) -q -e js -w client bin/watchBrowserify

styl:
	@$(SUPERVISOR) -q -e styl -w public/styl bin/watchStyl

.PHONY: server browserify styl run build install all
