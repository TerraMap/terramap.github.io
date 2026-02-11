#include "TileColor.h"
#include "WorldLoader.h"
#include <set>

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>

template <typename T> emscripten::val marshalData(const std::pair<T, T> &pair)
{
    return emscripten::val::array(std::vector<T>{pair.first, pair.second});
}

template <
    typename C,
    typename T = std::decay_t<decltype(*std::begin(std::declval<C>()))>>
emscripten::val marshalData(const C &data)
{
    std::vector<emscripten::val> jsData;
    for (auto &row : data) {
        jsData.push_back(marshalData(row));
    }
    return emscripten::val::array(jsData);
}

emscripten::val marshalData(const Point &point)
{
    auto result = emscripten::val::object();
    result.set("x", point.x);
    result.set("y", point.y);
    return result;
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
    result.set("homelessDespawn", npc.homelessDespawn);
    return result;
}

emscripten::val marshalData(const CreativePowers &pwr)
{
    auto result = emscripten::val::object();
    result.set("freezeTime", pwr.freezeTime);
    result.set("timeRate", pwr.timeRate);
    result.set("freezeRainStatus", pwr.freezeRainStatus);
    result.set("freezeWindStatus", pwr.freezeWindStatus);
    result.set("difficulty", pwr.difficulty);
    result.set("freezeBiomeSpread", pwr.freezeBiomeSpread);
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
        return "";
    case Slope::half:
        return "Half";
    case Slope::topRight:
        return "Top Right";
    case Slope::topLeft:
        return "Top Left";
    case Slope::bottomRight:
        return "Bottom Right";
    case Slope::bottomLeft:
        return "Bottom Left";
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

void marshalData(const Point &point)
{
    std::cout << "{x:" << point.x << ",y:" << point.y << '}';
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
              << ",homelessDespawn:" << npc.homelessDespawn << '}';
}

void marshalData(const CreativePowers &pwr)
{
    std::cout << "{freezeTime:" << pwr.freezeTime
              << ",timeRate:" << pwr.timeRate
              << ",freezeRainStatus:" << pwr.freezeRainStatus
              << ",freezeWindStatus:" << pwr.freezeWindStatus
              << ",difficulty:" << pwr.difficulty
              << ",freezeBiomeSpread:" << pwr.freezeBiomeSpread << '}';
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
    DUMP(skyblock);
    DUMP(creationTime);
    DUMP(lastPlayed);

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
    DUMP_ARRAY(claimableBanners);
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
    DUMP(unlockedNerdySlime);
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
    DUMP(unlockedCoolSlime);
    DUMP(unlockedElderSlime);
    DUMP(unlockedClumsySlime);
    DUMP(unlockedDivaSlime);
    DUMP(unlockedSurlySlime);
    DUMP(unlockedMysticSlime);
    DUMP(unlockedSquireSlime);
    DUMP(fastForwardTimeToDusk);
    DUMP(moondialCooldown);
    DUMP(endlessHalloween);
    DUMP(endlessChristmas);
    DUMP(vampirism);
    DUMP(infectedWorld);
    DUMP(meteorShowerCount);
    DUMP(coinRain);
    DUMP(teamBasedSpawns);
    DUMP_CUSTOM(extraSpawnPoints);
    DUMP(dualDungeons);
    DUMP(worldGenManifest);

    DUMP_CUSTOM(chests);
    DUMP_CUSTOM(signs);
    DUMP_ARRAY(shimmeredNPCs);
    DUMP_CUSTOM(npcs);
    DUMP_CUSTOM(creative);
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
    std::vector<std::pair<int, int>> searchResults;

    void searchBlocks(
        const std::set<int> &blockIds,
        std::set<std::pair<int, int>> &results)
    {
        for (int x = 0; x < world.width; ++x) {
            for (int y = 0; y < world.height; ++y) {
                if (blockIds.contains(world.getTile(x, y).blockId)) {
                    results.emplace(x, y);
                }
            }
        }
    }

    void searchFramedBlocks(
        int blockId,
        int minU,
        int maxU,
        int minV,
        int maxV,
        std::set<std::pair<int, int>> &results)
    {
        for (int x = 0; x < world.width; ++x) {
            for (int y = 0; y < world.height; ++y) {
                Tile &tile = world.getTile(x, y);
                if (tile.blockId == blockId && tile.frameX >= minU &&
                    tile.frameX < maxU && tile.frameY >= minV &&
                    tile.frameY < maxV) {
                    results.emplace(x, y);
                }
            }
        }
    }

    void searchWalls(int wallId, std::set<std::pair<int, int>> &results)
    {
        for (int x = 0; x < world.width; ++x) {
            for (int y = 0; y < world.height; ++y) {
                if (world.getTile(x, y).wallId == wallId) {
                    results.emplace(x, y);
                }
            }
        }
    }

    std::pair<int, int> parseLookupKey(int lookupKey)
    {
        int y = lookupKey % world.height;
        return {(lookupKey - y) / world.height, y};
    }

    void searchItems(int itemId, std::set<std::pair<int, int>> &results)
    {
        for (auto [lookupKey, chestId] : chestLookup) {
            for (const Item &item : world.chests[chestId].items) {
                if (item.id == itemId) {
                    results.insert(parseLookupKey(lookupKey));
                    break;
                }
            }
        }
        for (auto [lookupKey, entityId] : entityLookup) {
            const TileEntity &entity = world.tileEntities[entityId];
            for (const Item &item : entity.items) {
                if (item.id == itemId) {
                    results.insert(parseLookupKey(lookupKey));
                    break;
                }
            }
            for (const Item &item : entity.dyes) {
                if (item.id == itemId) {
                    results.insert(parseLookupKey(lookupKey));
                    break;
                }
            }
        }
    }

    void putImageData(const std::vector<uint32_t> &pixels, const char *ctx)
    {
        EM_ASM(
            {
                const data =
                    new Uint8ClampedArray(wasmMemory.buffer, $0, $1 * $2 * 4);
                const imageData = new ImageData(data, $1);
                self[UTF8ToString($3)].putImageData(imageData, 0, 0);
            },
            pixels.data(),
            world.width,
            world.height,
            ctx);
    }

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
        searchResults.clear();
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
        putImageData(pixels, "ctx");
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

    void search(const emscripten::val &queries)
    {
        int numQueries = queries["length"].as<int>();
        std::set<std::pair<int, int>> results;
        std::set<int> blockIds;
        for (int i = 0; i < numQueries; ++i) {
            int id = queries[i]["id"].as<int>();
            switch (queries[i]["type"].as<int>()) {
            case 0:
                blockIds.insert(id);
                break;
            case 1:
                searchFramedBlocks(
                    id,
                    queries[i]["minU"].as<int>(),
                    queries[i]["maxU"].as<int>(),
                    queries[i]["minV"].as<int>(),
                    queries[i]["maxV"].as<int>(),
                    results);
                break;
            case 2:
                searchWalls(id, results);
                break;
            case 3:
                searchItems(id, results);
                break;
            }
        }
        if (!blockIds.empty()) {
            searchBlocks(blockIds, results);
        }
        searchResults.clear();
        searchResults.assign(results.begin(), results.end());

        std::vector<uint32_t> pixels(world.width * world.height, 0xbf000000);
        for (auto [x, y] : searchResults) {
            pixels[y * world.width + x] = 0xffffffff;
        }
        putImageData(pixels, "overlayCtx");
    }

    emscripten::val findNext(int x, int y, int direction)
    {
        std::pair pt{x, y};
        auto bound =
            std::lower_bound(searchResults.begin(), searchResults.end(), pt);
        if (direction < 0) {
            if (bound == searchResults.begin()) {
                return emscripten::val::null();
            }
            --bound;
        } else if (bound != searchResults.end() && *bound == pt) {
            ++bound;
        }
        return bound == searchResults.end() ? emscripten::val::null()
                                            : marshalData(*bound);
    }
};

EMSCRIPTEN_BINDINGS(terramap)
{
    emscripten::class_<Loader>("Loader")
        .constructor()
        .function("loadWorldFile", &Loader::loadWorldFile)
        .function("renderToCanvas", &Loader::renderToCanvas)
        .function("getTile", &Loader::getTile)
        .function("search", &Loader::search)
        .function("findNext", &Loader::findNext);
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
