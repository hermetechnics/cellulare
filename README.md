# cellulare
A journey into the Network

## How it works

The app runs on a Python 3 server using `tornado`. The client app is served statically from `client` and uses modern JS modules,
so it doesn't currently support non-evergreen browsers (such as IE and possibly also older Edge).

On the server, we use socket-io to serve WebSockets. We can broadcast messages to all clients, send them to specific clients (`sid`s),
and receive messages from clients. See `main.py`.

View the [client README](./client/README.md) for more info about the client-side code.

## Running locally

```
python3 main.py
```

The client will be available at `localhost:8888/index.html`.
