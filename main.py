from flask import Flask, render_template, request
from os import listdir
from random import shuffle

game = Flask(__name__)


PIC_COUNT = 23


@game.route("/start")
def start():
    if 'Mobile' in request.headers.get('User-Agent'):
        return "Mobile is not allowed (even if it's Nexus 5X). Open this page using your PC."

    levels = []
    for file_name in sorted(listdir('static/levels/')):
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
    indexies = ["%02.d" % i for i in range(PIC_COUNT)]
    shuffle(indexies)
    return render_template(
        "greatings.html",
        pictures=indexies
    )


@game.route("/detail/<index>")
def detail(index):
    return render_template(
        "detail.html",
        index=index,
        next="%02.d" % ((int(index) + 1) % PIC_COUNT),
        prev="%02.d" % ((int(index) + PIC_COUNT - 1) % PIC_COUNT)
    )


@game.route("/instructions")
def instructions():
    return "instructions"
