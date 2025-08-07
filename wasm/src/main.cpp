#include "TileColor.h"
#include "WorldLoader.h"

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>

template <typename T> emscripten::val marshalData(const std::vector<T> &data)
{
    std::vector<emscripten::val> jsData;
    for (auto &row : data) {
        jsData.push_back(marshalData(row));
    }
    return emscripten::val::array(jsData);
}

emscripten::val marshalData(const Item &item)
{
    auto result = emscripten::val::object();
    result.set("id", item.id);
    result.set("stack", item.stack);
    result.set("prefix", item.prefix);
    return result;
}

emscripten::val marshalData(const Chest &chest)
{
    auto result = emscripten::val::object();
    result.set("x", chest.x);
    result.set("y", chest.y);
    result.set("name", chest.name);
    result.set("items", marshalData(chest.items));
    return result;
}

emscripten::val marshalData(const Sign &sign)
{
    auto result = emscripten::val::object();
    result.set("x", sign.x);
    result.set("y", sign.y);
    result.set("text", sign.text);
    return result;
}

emscripten::val marshalData(const NPC &npc)
{
    auto result = emscripten::val::object();
    result.set("id", npc.id);
    result.set("type", npc.type);
    result.set("name", npc.name);
    result.set("x", npc.x);
    result.set("y", npc.y);
    result.set("isHomeless", npc.isHomeless);
    result.set("homeX", npc.homeX);
    result.set("homeY", npc.homeY);
    result.set("variation", npc.variation);
    return result;
}

std::string marshalData(Liquid liquid)
{
    switch (liquid) {
    case Liquid::none:
        return "";
    case Liquid::water:
        return "Water";
    case Liquid::lava:
        return "Lava";
    case Liquid::honey:
        return "Honey";
    case Liquid::shimmer:
        return "Shimmer";
    }
}

std::string marshalData(Slope slope)
{
    switch (slope) {
    case Slope::none:
        return "none";
    case Slope::half:
        return "half";
    case Slope::topRight:
        return "topRight";
    case Slope::topLeft:
        return "topLeft";
    case Slope::bottomRight:
        return "bottomRight";
    case Slope::bottomLeft:
        return "bottomLeft";
    }
}

emscripten::val marshalData(const Tile &tile)
{
    auto result = emscripten::val::object();
    result.set("blockId", tile.blockId);
    result.set("frameX", tile.frameX);
    result.set("frameY", tile.frameY);
    result.set("wallId", tile.wallId);
    result.set("blockPaint", tile.blockPaint);
    result.set("wallPaint", tile.wallPaint);
    result.set("liquidAmount", tile.liquidAmount);
    result.set("liquid", marshalData(tile.liquid));
    result.set("slope", marshalData(tile.slope));
    result.set("wireRed", tile.wireRed);
    result.set("wireBlue", tile.wireBlue);
    result.set("wireGreen", tile.wireGreen);
    result.set("wireYellow", tile.wireYellow);
    result.set("actuated", tile.actuated);
    result.set("actuator", tile.actuator);
    result.set("echoCoatBlock", tile.echoCoatBlock);
    result.set("echoCoatWall", tile.echoCoatWall);
    result.set("illuminantBlock", tile.illuminantBlock);
    result.set("illuminantWall", tile.illuminantWall);
    return result;
}

emscripten::val marshalData(const TileEntity &entity)
{
    auto result = emscripten::val::object();
    result.set("id", entity.id);
    result.set("type", entity.type);
    result.set("x", entity.x);
    result.set("y", entity.y);
    result.set("sensorType", entity.sensorType);
    result.set("sensorActive", entity.sensorActive);
    result.set("items", marshalData(entity.items));
    result.set("dyes", marshalData(entity.dyes));
    return result;
}

#define DUMP(field) result.set(#field, world.field)
#define DUMP_ARRAY(field)                                                      \
    result.set(                                                                \
        #field,                                                                \
        emscripten::val::array(world.field.begin(), world.field.end()))
#define DUMP_CUSTOM(field) result.set(#field, marshalData(world.field))

emscripten::val dumpWorld(const World &world)
{
    auto result = emscripten::val::object();
#else
#include <fstream>
#include <iostream>
#include <sstream>

template <typename T> void marshalData(const std::vector<T> &data)
{
    std::cout << '[';
    for (auto &row : data) {
        marshalData(row);
        std::cout << ',';
    }
    std::cout << ']';
}

void marshalData(const Item &item)
{
    std::cout << "{id:" << item.id << ",stack:" << item.stack
              << ",prefix:" << item.prefix << '}';
}

void marshalData(const Chest &chest)
{
    std::cout << "{\nx:" << chest.x << ",y:" << chest.y << ",\nname:\""
              << chest.name << "\",\nitems:";
    marshalData(chest.items);
    std::cout << "\n}";
}

void marshalData(const Sign &sign)
{
    std::cout << "{x:" << sign.x << ",y:" << sign.y << ",text:\"" << sign.text
              << "\"}";
}

void marshalData(const NPC &npc)
{
    std::cout << "{id:" << npc.id << ",type:\"" << npc.type << "\",name:\""
              << npc.name << "\",x:" << npc.x << ",y:" << npc.y
              << ",isHomeless:" << npc.isHomeless << ",homeX:" << npc.homeX
              << ",homeY:" << npc.homeY << ",variation:" << npc.variation
              << '}';
}

#define DUMP(field) std::cout << #field " " << world.field << '\n'
#define DUMP_ARRAY(field)                                                      \
    do {                                                                       \
        std::cout << #field " [";                                              \
        for (auto val : world.field) {                                         \
            std::cout << val << ',';                                           \
        };                                                                     \
        std::cout << "]\n";                                                    \
    } while (0)
#define DUMP_CUSTOM(field)                                                     \
    do {                                                                       \
        std::cout << #field " ";                                               \
        marshalData(world.field);                                              \
        std::cout << '\n';                                                     \
    } while (0)

void dumpWorld(const World &world)
{
#endif
    DUMP(version);
    DUMP(revision);
    DUMP(isFavorite);
    DUMP_ARRAY(framedTiles);

    DUMP(name);
    DUMP(seed);
    DUMP(generatorVersion);
    DUMP(guid);
    DUMP(id);
    DUMP(left);
    DUMP(right);
    DUMP(top);
    DUMP(bottom);
    DUMP(height);
    DUMP(width);
    DUMP(gameMode);
    DUMP(drunkWorld);
    DUMP(forTheWorthy);
    DUMP(celebrationmk10);
    DUMP(theConstant);
    DUMP(notTheBees);
    DUMP(dontDigUp);
    DUMP(noTraps);
    DUMP(getFixedBoi);
    DUMP(creationTime);

    DUMP(moonType);
    DUMP_ARRAY(treeStyleCoords);
    DUMP_ARRAY(treeStyles);
    DUMP_ARRAY(caveStyleCoords);
    DUMP_ARRAY(caveStyles);
    DUMP(iceStyle);
    DUMP(jungleStyle);
    DUMP(underworldStyle);
    DUMP_ARRAY(spawn);
    DUMP(undergroundLevel);
    DUMP(cavernLevel);
    DUMP(gameTime);
    DUMP(isDay);
    DUMP(moonPhase);
    DUMP(bloodMoon);
    DUMP(eclipse);
    DUMP_ARRAY(dungeon);
    DUMP(isCrimson);

    DUMP(downedEyeOfCthulu);
    DUMP(downedEaterOfWorlds);
    DUMP(downedSkeletron);
    DUMP(downedQueenBee);
    DUMP(downedTheDestroyer);
    DUMP(downedTheTwins);
    DUMP(downedSkeletronPrime);
    DUMP(downedAnyHardmodeBoss);
    DUMP(downedPlantera);
    DUMP(downedGolem);
    DUMP(downedSlimeKing);
    DUMP(savedGoblinTinkerer);
    DUMP(savedWizard);
    DUMP(savedMechanic);
    DUMP(defeatedGoblinInvasion);
    DUMP(downedClown);
    DUMP(defeatedFrostLegion);
    DUMP(defeatedPirates);

    DUMP(brokeAShadowOrb);
    DUMP(meteorSpawned);
    DUMP(shadowOrbsBroken);
    DUMP(altarsSmashed);
    DUMP(hardMode);
    DUMP(partyOfDoom);
    DUMP(goblinInvasionDelay);
    DUMP(goblinInvasionSize);
    DUMP(goblinInvasionType);
    DUMP(goblinInvasionX);
    DUMP(slimeRainTime);
    DUMP(sundialCooldown);
    DUMP(raining);
    DUMP(rainTimeLeft);
    DUMP(maxRain);
    DUMP(cobaltVariant);
    DUMP(mythrilVariant);
    DUMP(adamantiteVariant);
    DUMP(forestStyle1);
    DUMP(corruptionStyle);
    DUMP(undergroundJungleStyle);
    DUMP(snowStyle);
    DUMP(hallowStyle);
    DUMP(crimsonStyle);
    DUMP(desertStyle);
    DUMP(oceanStyle);
    DUMP(cloudBackground);
    DUMP(numberOfClouds);
    DUMP(windSpeed);

    DUMP_ARRAY(anglersFinishedDailyQuest);
    DUMP(savedAngler);
    DUMP(anglerQuest);
    DUMP(savedStylist);
    DUMP(savedTaxCollector);
    DUMP(savedGolfer);
    DUMP(invasionStartSize);
    DUMP(cultistDelay);
    DUMP_ARRAY(enemyKillTallies);
    DUMP(fastForwardTimeToDawn);

    DUMP(downedFishron);
    DUMP(downedMartians);
    DUMP(downedLunaticCultist);
    DUMP(downedMoonlord);
    DUMP(downedHalloweenPumpking);
    DUMP(downedHalloweenMourningWood);
    DUMP(downedChristmasIceQueen);
    DUMP(downedChristmasSantaNK1);
    DUMP(downedChristmasEverscream);
    DUMP(downedTowerSolar);
    DUMP(downedTowerVortex);
    DUMP(downedTowerNebula);
    DUMP(downedTowerStardust);
    DUMP(towerActiveSolar);
    DUMP(towerActiveVortex);
    DUMP(towerActiveNebula);
    DUMP(towerActiveStardust);
    DUMP(lunarApocalypseIsUp);

    DUMP(partyManual);
    DUMP(partyGenuine);
    DUMP(partyCooldown);
    DUMP_ARRAY(partyingNPCs);
    DUMP(sandstormActive);
    DUMP(sandstormTimeLeft);
    DUMP(sandstormSeverity);
    DUMP(sandstormIntendedSeverity);
    DUMP(savedBartender);
    DUMP(downedInvasionTier1);
    DUMP(downedInvasionTier2);
    DUMP(downedInvasionTier3);
    DUMP(mushroomStyle);
    DUMP(underworldStyle2);
    DUMP(forestStyle2);
    DUMP(forestStyle3);
    DUMP(forestStyle4);
    DUMP(combatBookUsed);
    DUMP(lanternNightCooldown);
    DUMP(lanternNightGenuine);
    DUMP(lanternNightManual);
    DUMP(lanternNightNextIsGenuine);
    DUMP_ARRAY(treeTopVariations);
    DUMP(forceHalloween);
    DUMP(forceChristmas);
    DUMP(copperVariant);
    DUMP(ironVariant);
    DUMP(silverVariant);
    DUMP(goldVariant);
    DUMP(boughtCat);
    DUMP(boughtDog);
    DUMP(boughtBunny);

    DUMP(downedEmpressOfLight);
    DUMP(downedQueenSlime);
    DUMP(downedDeerclops);
    DUMP(unlockedSlimeBlue);
    DUMP(unlockedMerchant);
    DUMP(unlockedDemolitionist);
    DUMP(unlockedPartyGirl);
    DUMP(unlockedDyeTrader);
    DUMP(unlockedTruffle);
    DUMP(unlockedArmsDealer);
    DUMP(unlockedNurse);
    DUMP(unlockedPrincess);
    DUMP(combatBookVolumeTwoUsed);
    DUMP(peddlersSatchelUsed);
    DUMP(unlockedSlimeGreen);
    DUMP(unlockedSlimeOld);
    DUMP(unlockedSlimePurple);
    DUMP(unlockedSlimeRainbow);
    DUMP(unlockedSlimeRed);
    DUMP(unlockedSlimeYellow);
    DUMP(unlockedSlimeCopper);
    DUMP(fastForwardTimeToDusk);
    DUMP(moondialCooldown);

    DUMP_CUSTOM(chests);
    DUMP_CUSTOM(signs);
    DUMP_ARRAY(shimmeredNPCs);
    DUMP_CUSTOM(npcs);
#ifdef __EMSCRIPTEN__
    return result;
}
#else
}
#endif

#ifdef __EMSCRIPTEN__
class Loader
{
    World world;
    std::map<int, int> chestLookup;
    std::map<int, int> signLookup;
    std::map<int, int> entityLookup;

public:
    emscripten::val loadWorldFile(const std::string &data)
    {
        world = readWorldFile(data);
        chestLookup.clear();
        for (size_t chestId = 0; chestId < world.chests.size(); ++chestId) {
            const Chest &chest = world.chests[chestId];
            int maxI = world.getTile(chest.x, chest.y).blockId == 88 ? 3 : 2;
            for (int i = 0; i < maxI; ++i) {
                for (int j = 0; j < 2; ++j) {
                    chestLookup[(chest.x + i) * world.height + chest.y + j] =
                        chestId;
                }
            }
        }
        signLookup.clear();
        for (size_t signId = 0; signId < world.signs.size(); ++signId) {
            const Sign &sign = world.signs[signId];
            for (int i = 0; i < 2; ++i) {
                for (int j = 0; j < 2; ++j) {
                    signLookup[(sign.x + i) * world.height + sign.y + j] =
                        signId;
                }
            }
        }
        entityLookup.clear();
        for (size_t entityId = 0; entityId < world.tileEntities.size();
             ++entityId) {
            const TileEntity &entity = world.tileEntities[entityId];
            int maxI = 1;
            int maxJ = 1;
            switch (entity.type) {
            case 1: // Item frame.
                maxI = 2;
                maxJ = 2;
                break;
            case 3: // (Wo)Mannequin.
                maxI = 2;
                maxJ = 3;
                break;
            case 4: // Weapon rack.
                maxI = 3;
                maxJ = 3;
                break;
            case 5: // Hat rack.
                maxI = 3;
                maxJ = 4;
                break;
            }
            for (int i = 0; i < maxI; ++i) {
                for (int j = 0; j < maxJ; ++j) {
                    entityLookup[(entity.x + i) * world.height + entity.y + j] =
                        entityId;
                }
            }
        }
        return dumpWorld(world);
    }

    void renderToCanvas()
    {
        std::vector<uint32_t> pixels;
        pixels.reserve(world.width * world.height);
        for (int y = 0; y < world.height; ++y) {
            for (int x = 0; x < world.width; ++x) {
                pixels.push_back(getTileColor(x, y, world).abgr);
            }
        }
        EM_ASM_(
            {
                const data = HEAPU8.slice($0, $0 + $1 * $2 * 4);
                const ctx = self['ctx'];
                const imageData = ctx.getImageData(0, 0, $1, $2);
                imageData.data.set(data);
                ctx.putImageData(imageData, 0, 0);
            },
            pixels.data(),
            world.width,
            world.height);
    }

    emscripten::val getTile(int x, int y)
    {
        if (x < 0 || y < 0 || x >= world.width || y >= world.height) {
            return emscripten::val::null();
        }
        auto result = marshalData(world.getTile(x, y));
        int lookupKey = x * world.height + y;
        auto chestItr = chestLookup.find(lookupKey);
        if (chestItr != chestLookup.end()) {
            result.set("chest", marshalData(world.chests[chestItr->second]));
        }
        auto signItr = signLookup.find(lookupKey);
        if (signItr != signLookup.end()) {
            result.set("sign", marshalData(world.signs[signItr->second]));
        }
        auto entityItr = entityLookup.find(lookupKey);
        if (entityItr != entityLookup.end()) {
            result.set(
                "tileEntity",
                marshalData(world.tileEntities[entityItr->second]));
        }
        return result;
    }
};

EMSCRIPTEN_BINDINGS(terramap)
{
    emscripten::class_<Loader>("Loader")
        .constructor()
        .function("loadWorldFile", &Loader::loadWorldFile)
        .function("renderToCanvas", &Loader::renderToCanvas)
        .function("getTile", &Loader::getTile);
}
#else
int main()
{
    std::ifstream in("/path/to/Test_World.wld", std::ios::binary);
    std::ostringstream sstr;
    sstr << in.rdbuf();
    std::string data{sstr.str()};
    dumpWorld(readWorldFile(data));
}
#endif
