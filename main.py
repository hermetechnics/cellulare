import os

import numpy as np
import socketio
import tornado.ioloop
import tornado.web
from tornado.options import define, options, parse_command_line

from game_of_life.cell import Cell
from game_of_life.game_of_life import GameOfLife

np.random.seed(42)

define("port", default=8888, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")

sio = socketio.AsyncServer(async_mode='tornado')

game_of_life = None
spirits = []


"""
TODO: save the history of the grid for playback
TODO: send information back to specific client
"""


async def background_task():
    """Example of how to send server generated events to clients.
    use `sio.start_background_task to` start the task
    """
    count = 0
    while True:
        await sio.sleep(1)
        count += 1
        game_of_life.tick()
        print("step {}".format(count))
        await sio.emit("grid", game_of_life.grid.tolist())

        for spirit in spirits:
            await sio.emit("test", to=spirit.client_id)
            # TODO: this doesn't work yet

@sio.event
async def test_event(sid, message):
    print('received test_event from the client', message)

@sio.event
async def disconnect_request(sid):
    await sio.disconnect(sid)

@sio.event
async def connect(sid, environ):
    new_cell = Cell(game=game_of_life, client_id=sid)
    spirits.append(new_cell)
    print('Client connected', sid)

@sio.event
def disconnect(sid):
    print('Client disconnected')

def main():
    parse_command_line()
    app = tornado.web.Application(
        [
            (r"/socket.io/", socketio.get_tornado_handler(sio)),
            (r'/(.*)', tornado.web.StaticFileHandler, {
                'path': os.path.join(os.path.dirname(__file__), 'client')
            }),
        ],
        debug=options.debug,
    )
    sio.start_background_task(background_task)
    app.listen(options.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    game_of_life = GameOfLife()
    print("Starting the server.")
    main()
