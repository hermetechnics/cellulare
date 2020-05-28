import os

import tornado.ioloop
from tornado.options import define, options, parse_command_line
import tornado.web

import socketio

define("port", default=8888, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")

sio = socketio.AsyncServer(async_mode='tornado')

async def background_task():
    """Example of how to send server generated events to clients.
    use `sio.start_background_task to` start the task
    """
    count = 0
    while True:
        await sio.sleep(10)
        count += 1
        print('emitting pulse', count)
        await sio.emit('pulse', { 'data': count })

@sio.event
async def test_event(sid, message):
    print('received test_event from the client', message)

@sio.event
async def disconnect_request(sid):
    await sio.disconnect(sid)

@sio.event
async def connect(sid, environ):
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
    main()
