import numpy as np

ON = 1
SPIRIT = 1
OFF = 0

# how many ticks of frozen screen before the grid restarts
FROZEN_LIMIT = 5


class GameOfLife:
    def __init__(self, grid_size=10):
        self.grid_size = grid_size
        self.density = 0.1
        self.empty_ticks = 0

        self.grid = self.grid_init()
        print("initial state: \n", self.grid)

    def grid_init(self):
        return np.random.choice(a=[ON, OFF], size=(self.grid_size, self.grid_size), p=[self.density, 1-self.density])

    def get_grid_with_entities(self, spirits):
        grid_with_spirits = self.grid.copy()
        for spirit in spirits:
            grid_with_spirits[spirit.coordinate_x][spirit.coordinate_y] = 2

        return grid_with_spirits

    def tick(self):
        new_grid = self.grid.copy()
        for i in range(self.grid_size):
            for j in range(self.grid_size):

                total = self.calculate_neighbours(i, j)
                new_grid[i,j] = self.apply_rule(self.grid[i, j], total)

        if np.count_nonzero(np.subtract(self.grid, new_grid)) == 0:
            self.empty_ticks += 1
            print("FROZEN will restart in {}".format(FROZEN_LIMIT - self.empty_ticks))
            if FROZEN_LIMIT - self.empty_ticks:
                new_grid = self.grid_init()
        else:
            self.empty_ticks = 0

        self.grid = new_grid

    def apply_rule(self, current_cell, total):
        if current_cell == ON:
            if (total < 2) or (total > 3):
                return OFF
        else:
            if total == 3:
                return ON
        return current_cell

    def calculate_neighbours(self, i, j):
        """ compute 8-neghbor sum
            using toroidal boundary conditions - x and y wrap around
            so that the simulaton takes place on a toroidal surface.
            borrowed from https://www.geeksforgeeks.org/conways-game-life-python-implementation/ """
        return int((self.grid[i, (j - 1) % self.grid_size] + self.grid[i, (j + 1) % self.grid_size] +
                    self.grid[(i - 1) % self.grid_size, j] + self.grid[(i + 1) % self.grid_size, j] +
                    self.grid[(i - 1) % self.grid_size, (j - 1) % self.grid_size] + self.grid[
                        (i - 1) % self.grid_size, (j + 1) % self.grid_size] +
                    self.grid[(i + 1) % self.grid_size, (j - 1) % self.grid_size] + self.grid[
                        (i + 1) % self.grid_size, (j + 1) % self.grid_size]))

    def get_cell(self, spirit):
        return self.grid[spirit.coordinate_x][spirit.coordinate_y]
