from random import random

import numpy as np

ON = 1
SPIRIT = 1
OFF = 0

GRID_SIZE = 42

# how many ticks of frozen screen before the grid restarts
FROZEN_LIMIT = 5

ALGORITHM_RANDOM = 0
ALGORITHM_QUIET = 1
ALGORITHM_FULL = 2

class GameOfLife:
    def __init__(self, grid_size=GRID_SIZE):
        """if algorithm is set to random, it returns random values for all user outputs"""
        self.grid_size = grid_size
        self.density = 0.4
        self.empty_ticks = 0
        self.algorithm = ALGORITHM_RANDOM

        self.grid = self.grid_init()
        print("initial state: \n", self.grid)

    def grid_init(self):
        return np.random.choice(a=[ON, OFF], size=(self.grid_size, self.grid_size), p=[self.density, 1-self.density])

    def get_grid_with_entities(self, spirits):
        grid_with_spirits = self.grid.copy()
        for spirit in spirits:
            grid_with_spirits[spirit.coordinate_x][spirit.coordinate_y] = 2

        return grid_with_spirits

    def reset_game(self):
        self.grid = self.grid_init()

    def tick(self):
        if self.algorithm != ALGORITHM_RANDOM:
            new_grid = self.grid.copy()
            for coordinate_x in range(self.grid_size):
                for coordinate_y in range(self.grid_size):

                    total = self.calculate_neighbours(coordinate_x, coordinate_y)
                    new_grid[coordinate_x,coordinate_y] = self.apply_rule(self.grid[coordinate_x, coordinate_y], total)

            if np.count_nonzero(np.subtract(self.grid, new_grid)) == 0:
                self.empty_ticks += 1
                print("FROZEN will restart in {}".format(FROZEN_LIMIT - self.empty_ticks))
                if FROZEN_LIMIT - self.empty_ticks:
                    new_grid = self.grid_init()
            else:
                self.empty_ticks = 0

            self.grid = new_grid

    def get_neighbours(self, spirit):
        if self.algorithm == ALGORITHM_RANDOM:
            return [np.random.choice(a=[ON, OFF], p=[0.1, 0.9]) for i in range(8)]
        else:
            coordinates = self.get_neighbour_coordinates_pairs(spirit.coordinate_x, spirit.coordinate_y)
            return [self.get_grid_cell(coordinate[0], coordinate[1]) for coordinate in coordinates]


    def apply_rule(self, current_cell, total):
        if current_cell == ON:
            if (total < 2) or (total > 3):
                return OFF
        else:
            if total == 3:
                return ON
        return current_cell

    def get_spirit_factor(self, spirits):
        if len(spirits) == 0:
            return 0.0
        if self.algorithm == ALGORITHM_RANDOM:
            return np.random.uniform(low=0, high=0.5)
        else:
            return len([1 for spirit in spirits if self.grid[spirit.coordinate_x][spirit.coordinate_y]]) * 1.0 / len(spirits)

    def get_neighbour_coordinates_pairs(self, coordinate_x, coordinate_y):
        """anti-clockwise"""
        return [((coordinate_x - 1), (coordinate_y - 1)),
                (coordinate_x, (coordinate_y - 1)),
                ((coordinate_x + 1), (coordinate_y - 1)),
                ((coordinate_x + 1), coordinate_y),
                ((coordinate_x + 1), (coordinate_y + 1)),
                (coordinate_x, (coordinate_y + 1)),
                ((coordinate_x - 1), (coordinate_y + 1)),
                ((coordinate_x - 1), coordinate_y)]

    def get_grid_cell(self, coordinate_x, coordinate_y):
        """gets toroidal coordinate"""
        return self.grid[coordinate_x % self.grid_size][coordinate_y % self.grid_size]

    def set_grid_cell(self, coordinate_x, coordinate_y, value):
        """sets toroidal coordinate"""
        self.grid[coordinate_x % self.grid_size][coordinate_y % self.grid_size] = value


    def calculate_neighbours(self, coordinate_x, coordinate_y):
        """ compute 8-neghbor sum
            using toroidal boundary conditions - x and y wrap around
            so that the simulaton takes place on a toroidal surface.
            idea borrowed from https://www.geeksforgeeks.org/conways-game-life-python-implementation/ """
        coordinates = self.get_neighbour_coordinates_pairs(coordinate_x, coordinate_y)
        result = 0
        for coordinate in coordinates:
            result += self.get_grid_cell(coordinate[0], coordinate[1])
        return result

    def get_spirit_cell(self, spirit):
        if self.algorithm == ALGORITHM_RANDOM:
            return np.random.choice([ON, OFF], p=[0.1, 0.9])
        else:
            return self.get_grid_cell(spirit.coordinate_x, spirit.coordinate_y)

    def activate_neighbours(self, coordinate_x, coordinate_y):
        """when activity is triggered, we randomly set OFF values in the proximity to ON"""
        coordinates = self.get_neighbour_coordinates_pairs(coordinate_x, coordinate_y)
        for coordinate in coordinates:
            if self.get_grid_cell(coordinate[0], coordinate[1]) == OFF:
                self.set_grid_cell(coordinate[0], coordinate[1], np.random.choice([ON, OFF]))
