from flask import Flask, render_template
from os import listdir

game = Flask(__name__)


@game.route("/start")
def start():
    levels = []
    for file_name in listdir('static/levels/'):
        with open("static/levels/{}".format(file_name)) as f:
            body = f.readlines()
            x, y = len(body[0]) - 1, len(body)
            levels.append({
                "size": {"x": x, "y": y},
                "body": body
            })
    return render_template("index.html", levels=levels)


@game.route("/exit")
def end():
    return "todo: Greetings and next instructions."
