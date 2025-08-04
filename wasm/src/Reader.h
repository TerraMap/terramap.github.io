#ifndef READER_H
#define READER_H

#include <cstdint>
#include <string>
#include <vector>

class Reader
{
private:
    size_t pos;
    const std::string &data;

public:
    Reader(const std::string &d);

    std::vector<bool> getBitVec();
    bool getBool();
    double getFloat32();
    double getFloat64();
    std::string getString();
    uint8_t getUint8();
    uint16_t getUint16();
    uint32_t getUint32();
    uint64_t getUint64();
    void skipBytes(size_t len);
};

#endif // READER_H
