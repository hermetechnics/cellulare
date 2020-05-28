from random import randrange

from game_of_life.game_of_life import SPIRIT


class Cell:
    def __init__(self, game, client_id):
        self.game = game
        self.client_id = client_id
        self.grid_size = game.grid_size
        self.coordinate_x = randrange(self.grid_size)
        self.coordinate_y = randrange(self.grid_size)
        self.register_to_grid()

    def register_to_grid(self):
        self.game.grid[self.coordinate_x][self.coordinate_y] = SPIRIT