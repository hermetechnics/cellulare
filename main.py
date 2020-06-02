import json
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
TODO: do not register debug as "spirit"

IDEAS: 
- slightly swing speed by the temperature on the grid (how many activated points)
- 'resonance' between two entities firing in the same time 
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
        await sio.emit("grid", { 'grid': game_of_life.get_grid_with_entities(spirits).tolist(), 'count': count })

        for spirit in spirits:
            await sio.emit('pulse', { 'my_cell': "{}".format(game_of_life.get_spirit_cell(spirit)),
                                      'neighbours': "{}".format(game_of_life.get_neighbours(spirit))}, room=spirit.client_id)

@sio.event
async def test_event(sid, message):
    print('received test_event from the client', message)

@sio.event
async def connect(sid, environ):
    new_cell = Cell(game=game_of_life, client_id=sid)
    spirits.append(new_cell)
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
