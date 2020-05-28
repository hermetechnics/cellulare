import numpy as np

ON = 1
SPIRIT = 1
OFF = 0


class GameOfLife:
    def __init__(self, gird_size=10):
        self.grid_size = gird_size
        self.density = 0.3
        self.grid = np.random.choice(a=[ON, OFF], size=(gird_size, gird_size), p=[self.density, 1-self.density])
        print(self.grid)

    def tick(self):
        new_grid = self.grid.copy()
        for i in range(self.grid_size):
            for j in range(self.grid_size):

                total = self.calculate_neighbours(i, j)
                new_grid[i,j] = self.apply_rule(self.grid[i, j], total)

        self.grid = new_grid
        print(self.grid)

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

