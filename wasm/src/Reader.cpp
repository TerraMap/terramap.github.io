#include "Reader.h"
#include "ieee754_types.hpp"

#include <bit>

typedef IEEE_754::_2008::Binary<32> float32_t;
typedef IEEE_754::_2008::Binary<64> float64_t;

namespace
{

template <typename NumberType, size_t byteCount>
NumberType readLittleEndian(const char *buffer)
{
    NumberType result = 0;
    for (int i = byteCount - 1; i >= 0; --i) {
        result <<= 8;
        result |= static_cast<unsigned char>(buffer[i]);
    }
    return result;
}

} // namespace

Reader::Reader(const std::string &d) : pos(0), data(d) {}

std::vector<bool> Reader::getBitVec()
{
    int len = getUint16();
    std::vector<bool> result;
    uint8_t buf = 0;
    for (int i = 0, offset = 0; i < len; ++i, ++offset) {
        if (offset % 8 == 0) {
            buf = getUint8();
            offset = 0;
        }
        result.push_back((buf & (1 << offset)) != 0);
    }
    return result;
}

bool Reader::getBool()
{
    return getUint8() != 0;
}

double Reader::getFloat32()
{
    return std::bit_cast<float32_t>(getUint32());
}

double Reader::getFloat64()
{
    return std::bit_cast<float64_t>(getUint64());
}

std::string Reader::getString()
{
    if (pos + 1 > data.size()) {
        return {};
    }
    // LEB128 encoded length prefix.
    size_t len = 0;
    size_t shift = 0;
    uint8_t b;
    do {
        b = getUint8();
        len |= (b & 0x7f) << shift;
        shift += 7;
    } while ((b & 0x80) != 0);
    std::string result = data.substr(pos, len);
    pos += len;
    return result;
}

uint8_t Reader::getUint8()
{
    if (pos + 1 > data.size()) {
        return {};
    }
    uint8_t result = data[pos];
    pos += 1;
    return result;
}

uint16_t Reader::getUint16()
{
    if (pos + 2 > data.size()) {
        return {};
    }
    uint16_t result = readLittleEndian<uint16_t, 2>(data.c_str() + pos);
    pos += 2;
    return result;
}

uint32_t Reader::getUint32()
{
    if (pos + 4 > data.size()) {
        return {};
    }
    uint32_t result = readLittleEndian<uint32_t, 4>(data.c_str() + pos);
    pos += 4;
    return result;
}

uint64_t Reader::getUint64()
{
    if (pos + 8 > data.size()) {
        return {};
    }
    uint64_t result = readLittleEndian<uint64_t, 8>(data.c_str() + pos);
    pos += 8;
    return result;
}

void Reader::skipBytes(size_t len)
{
    pos += len;
}
