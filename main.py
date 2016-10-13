from flask import Flask, render_template

game = Flask(__name__)


@game.route("/start")
def start():
    return render_template("index.html")


@game.route("/exit")
def end():
    return "todo: Greetings and next instructions."
