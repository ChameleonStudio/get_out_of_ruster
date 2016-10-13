from flask import Flask

game = Flask(__name__)


@game.route("/start")
def start():
    return "todo: GET OUT OF THE RASTER"


@game.route("/exit")
def end():
    return "todo: Greetings and next instructions."
