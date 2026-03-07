#ifndef TILECOLOR_H
#define TILECOLOR_H

#include <cstdint>
#include <vector>

class World;

class Color
{
public:
    Color() = default;
    Color(uint8_t *rgb);

    void set(uint8_t r, uint8_t g, uint8_t b);
    uint8_t r() const;
    uint8_t g() const;
    uint8_t b() const;

    void blend(Color tint, double strength = 0.3);
    void ditherBlend(
        Color tint,
        double strength,
        int x,
        std::vector<double> &errCur,
        std::vector<double> &errNext);
    void hueBlend(Color tint);

    uint32_t abgr;
};

Color getTileColor(
    int x,
    int y,
    std::vector<double> &errCur,
    std::vector<double> &errNext,
    World &world);

#endif // TILECOLOR_H
