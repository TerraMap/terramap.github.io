#ifndef TILECOLOR_H
#define TILECOLOR_H

#include <cstdint>

class World;

class Color
{
public:
    Color() = default;
    Color(uint8_t *rgb);
    Color(uint8_t r, uint8_t g, uint8_t b);

    void set(uint8_t r, uint8_t g, uint8_t b);
    uint8_t r() const;
    uint8_t g() const;
    uint8_t b() const;

    uint32_t abgr;
};

Color getTileColor(int x, int y, World &world);

#endif // TILECOLOR_H
