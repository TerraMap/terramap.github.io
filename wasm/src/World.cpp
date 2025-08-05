#include "World.h"

void World::initTiles()
{
    tiles.clear();
    tiles.resize(width * height);
}

Tile &World::getTile(int x, int y)
{
    return tiles[y + x * height];
}
