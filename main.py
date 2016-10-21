from flask import Flask, render_template, request
from os import listdir
from random import shuffle
from functools import wraps

game = Flask(__name__)


PIC_COUNT = 23


def mobile_only(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        if 'Mobile' in request.headers.get('User-Agent'):
            return "Mobile is not allowed (even if it's Nexus 5X). Open this page using your PC."
        return result
    return wrapper


def load_levels(dir_name):
    levels = []
    for file_name in sorted(listdir('static/{}/'.format(dir_name))):
        with open("static/{}/{}".format(dir_name, file_name)) as f:
            body = f.readlines()
            x, y = len(body[0]) - 1, len(body)
            levels.append({
                "size": {"x": x, "y": y},
                "body": body
            })
    return levels


@game.route("/")
def home():
    return render_template("home.html")


@game.route("/game")
@mobile_only
def start():
    return render_template("index.html", levels=load_levels("levels"))


@game.route("/start")
@mobile_only
def natali_levels():
    return render_template("index.html", levels=load_levels("natali_levels"))


@game.route("/end")
def end():
    return "END"
