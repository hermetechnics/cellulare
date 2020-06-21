import os

import numpy as np
import socketio
import tornado.ioloop
import tornado.web
from tornado.options import define, options, parse_command_line

from game_of_life.cell import Cell
from game_of_life.game_of_life import GameOfLife, ALGORITHM_FULL

np.random.seed(42)

define("port", default=8888, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")

sio = socketio.AsyncServer(async_mode='tornado')

paused = False

game_of_life = None
spirits = []
server_count = 0

"""
TODO: save the history of the grid for playback
TODO: do not register debug as "spirit"

IDEAS:
- slightly swing speed by the temperature on the grid (how many activated points)
- 'resonance' between two entities firing in the same time
"""


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")


class DebugHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("debug.html")


async def background_task():
    """Example of how to send server generated events to clients.
    use `sio.start_background_task to` start the task
    """
    global server_count
    global spirits
    while True:
        await sio.sleep(1)
        if not paused:
            server_count += 1
            game_of_life.tick()
            await sio.emit("grid", {'grid': game_of_life.get_grid_with_entities(spirits).tolist(),
                                    'count': server_count,
                                    'density': game_of_life.density,
                                    'algorithm': game_of_life.algorithm})

            spirit_factor = game_of_life.get_spirit_factor(spirits)
            for spirit in spirits:
                await sio.emit('pulse', {'my_cell': "{}".format(game_of_life.get_spirit_cell(spirit)),
                                         'neighbours': "{}".format(game_of_life.get_neighbours(spirit)),
                                         'spirit_factor': "{}".format(spirit_factor)}, room=spirit.client_id)


@sio.event
async def test_event(sid, message):
    print('received test_event from the client', message)


@sio.on('reset_game')
def reset_game(sid, data):
    global server_count
    server_count = 0

    print("resetting game!")
    game_of_life.density = float(data["density"])
    game_of_life.algorithm = int(data["algorithm"])
    game_of_life.reset_game()


@sio.on('pause')
async def pause_resume_server(sid, data):
    global paused
    paused = not paused
    if paused:
        await trigger_call_back_drumming()
    else:
        await resume_drumming()
    print("paused: {}".format(paused))


async def trigger_call_back_drumming():
    await sio.emit("call_back_drumming", {})


async def resume_drumming():
    await sio.emit("resume_drumming", {})


@sio.on('trigger_activity')
def trigger_activity(sid, data):
    # TODO: if activity has some additional value than boolean parse here:
    activity = True
    if game_of_life.algorithm == ALGORITHM_FULL:
        print("User triggered activity")
        spirit = next((s for s in spirits if s.client_id == sid), None)
        if spirit:
            spirit.activate(activity)


@sio.on('register_cell')
def trigger_activity(sid):
    print('new cell')
    new_cell = Cell(game=game_of_life, client_id=sid)
    spirits.append(new_cell)


@sio.event
async def connect(sid, environ):
    print('Client connected', sid)


@sio.event
def disconnect(sid):
    global spirits
    new_spirits = [s for s in spirits if s.client_id != sid]
    spirits = new_spirits
    print('Client disconnected')


def main():
    parse_command_line()
    app = tornado.web.Application(
        [
            (r"/", MainHandler),
            (r"/debug", DebugHandler),
            (r"/socket.io/", socketio.get_tornado_handler(sio)),
            (r'/(.*)', tornado.web.StaticFileHandler, {
                'path': os.path.join(os.path.dirname(__file__), 'client')
            }),
        ],
        template_path=os.path.join(os.path.dirname(__file__), "client"),
        debug=options.debug,
    )
    sio.start_background_task(background_task)
    app.listen(options.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    game_of_life = GameOfLife()
    print("Starting the server.")
    main()
