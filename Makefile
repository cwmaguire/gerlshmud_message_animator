PROJECT = gerlshmud_message_animator
DEPS = lists animation js_util

dep_lists = git https://github.com/cwmaguire/lists master
dep_animation = git https://github.com/cwmaguire/animation master
dep_js_util = git https://github.com/cwmaguire/js_util master

include erlang.mk
