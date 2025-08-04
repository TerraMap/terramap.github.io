#include "Reader.h"
#include "World.h"

#include <chrono>
#include <format>

#ifndef __EMSCRIPTEN__
void printWorld(World &world);
#endif

std::string parseBinaryTime(uint64_t ticks)
{
    uint64_t ms = ticks / 10000 - 62135596800000ull;
    auto time = std::chrono::sys_time{std::chrono::milliseconds{ms}};
    return std::format("{:%e %B %Y}", time);
}

void readProperties(Reader &r, World &world)
{
    world.version = r.getUint32();
    r.skipBytes(8);
    world.revision = r.getUint32();
    world.isFavorite = r.getBool();
    r.skipBytes(7);
    r.skipBytes(4 * r.getUint16());
    world.framedTiles = r.getBitVec();

    world.name = r.getString();
    if (world.version >= 179) {
        world.seed = world.version == 179 ? std::to_string(r.getUint32())
                                          : r.getString();
        world.generatorVersion = std::to_string(r.getUint64());
    }
    if (world.version >= 181) {
        for (int i = 0; i < 16; ++i) {
            if (i == 4 || i == 6 || i == 8 || i == 10) {
                world.guid += '-';
            }
            world.guid += std::format("{:x}", r.getUint8());
        }
    }
    world.id = r.getUint32();
    world.left = r.getUint32();
    world.right = r.getUint32();
    world.top = r.getUint32();
    world.bottom = r.getUint32();
    world.height = r.getUint32();
    world.width = r.getUint32();
    if (world.version >= 209) {
        world.gameMode = r.getUint32();
        if (world.version >= 222) {
            world.drunkWorld = r.getBool();
        }
        if (world.version >= 227) {
            world.forTheWorthy = r.getBool();
        }
        if (world.version >= 238) {
            world.celebrationmk10 = r.getBool();
        }
        if (world.version >= 239) {
            world.theConstant = r.getBool();
        }
        if (world.version >= 241) {
            world.notTheBees = r.getBool();
        }
        if (world.version >= 249) {
            world.dontDigUp = r.getBool();
        }
        if (world.version >= 266) {
            world.noTraps = r.getBool();
        }
        world.getFixedBoi = world.version < 267
                                ? world.drunkWorld && world.dontDigUp
                                : r.getBool();
    } else if (world.version >= 112) {
        world.gameMode = r.getBool() ? 1 : 0;
    }
    if (world.version >= 141) {
        world.creationTime = parseBinaryTime(r.getUint64());
    }

    world.moonType = r.getUint8();
    for (auto &val : world.treeStyleCoords) {
        val = r.getUint32();
    }
    for (auto &val : world.treeStyles) {
        val = r.getUint32();
    }
    for (auto &val : world.caveStyleCoords) {
        val = r.getUint32();
    }
    for (auto &val : world.caveStyles) {
        val = r.getUint32();
    }
    world.iceStyle = r.getUint32();
    world.jungleStyle = r.getUint32();
    world.underworldStyle = r.getUint32();
    for (auto &val : world.spawn) {
        val = r.getUint32();
    }
    world.undergroundLevel = r.getFloat64();
    world.cavernLevel = r.getFloat64();
    world.gameTime = r.getFloat64();
    world.isDay = r.getBool();
    world.moonPhase = r.getUint32();
    world.bloodMoon = r.getBool();
    world.eclipse = r.getBool();
    for (auto &val : world.dungeon) {
        val = r.getUint32();
    }
    world.isCrimson = r.getBool();

    world.downedEyeOfCthulu = r.getBool();
    world.downedEaterOfWorlds = r.getBool();
    world.downedSkeletron = r.getBool();
    world.downedQueenBee = r.getBool();
    world.downedTheDestroyer = r.getBool();
    world.downedTheTwins = r.getBool();
    world.downedSkeletronPrime = r.getBool();
    world.downedAnyHardmodeBoss = r.getBool();
    world.downedPlantera = r.getBool();
    world.downedGolem = r.getBool();
    if (world.version >= 118) {
        world.downedSlimeKing = r.getBool();
    }
    world.savedGoblinTinkerer = r.getBool();
    world.savedWizard = r.getBool();
    world.savedMechanic = r.getBool();
    world.defeatedGoblinInvasion = r.getBool();
    world.downedClown = r.getBool();
    world.defeatedFrostLegion = r.getBool();
    world.defeatedPirates = r.getBool();

    world.brokeAShadowOrb = r.getBool();
    world.meteorSpawned = r.getBool();
    world.shadowOrbsBroken = r.getUint8();
    world.altarsSmashed = r.getUint32();
    world.hardMode = r.getBool();
    if (world.version >= 257) {
        world.partyOfDoom = r.getBool();
    }
    world.goblinInvasionDelay = r.getUint32();
    world.goblinInvasionSize = r.getUint32();
    world.goblinInvasionType = r.getUint32();
    world.goblinInvasionX = r.getFloat64();
    if (world.version >= 118) {
        world.slimeRainTime = r.getFloat64();
    }
    if (world.version >= 113) {
        world.sundialCooldown = r.getUint8();
    }
    world.raining = r.getBool();
    world.rainTimeLeft = r.getUint32();
    world.maxRain = r.getFloat32();
    world.cobaltVariant = r.getUint32();
    world.mythrilVariant = r.getUint32();
    world.adamantiteVariant = r.getUint32();
    world.forestStyle1 = r.getUint8();
    world.corruptionStyle = r.getUint8();
    world.undergroundJungleStyle = r.getUint8();
    world.snowStyle = r.getUint8();
    world.hallowStyle = r.getUint8();
    world.crimsonStyle = r.getUint8();
    world.desertStyle = r.getUint8();
    world.oceanStyle = r.getUint8();
    world.cloudBackground = r.getUint32();
    world.numberOfClouds = r.getUint16();
    world.windSpeed = r.getFloat32();
    if (world.version < 95) {
        return;
    }

    for (int i = r.getUint32(); i > 0; --i) {
        world.anglersFinishedDailyQuest.push_back(r.getString());
    }
    world.savedAngler = r.getBool();
    if (world.version < 101) {
        return;
    }
    world.anglerQuest = r.getUint32();
    if (world.version < 104) {
        return;
    }
    world.savedStylist = r.getBool();
    world.savedTaxCollector = r.getBool();
    if (world.version >= 201) {
        world.savedGolfer = r.getBool();
    }
    world.invasionStartSize = r.getUint32();
    world.cultistDelay = r.getUint32();
    for (int i = r.getUint16(); i > 0; --i) {
        world.enemyKillTallies.push_back(r.getUint32());
    }
    world.fastForwardTimeToDawn = r.getBool();

    world.downedFishron = r.getBool();
    world.downedMartians = r.getBool();
    world.downedLunaticCultist = r.getBool();
    world.downedMoonlord = r.getBool();
    world.downedHalloweenPumpking = r.getBool();
    world.downedHalloweenMourningWood = r.getBool();
    world.downedChristmasIceQueen = r.getBool();
    world.downedChristmasSantaNK1 = r.getBool();
    world.downedChristmasEverscream = r.getBool();
    world.downedTowerSolar = r.getBool();
    world.downedTowerVortex = r.getBool();
    world.downedTowerNebula = r.getBool();
    world.downedTowerStardust = r.getBool();
    world.towerActiveSolar = r.getBool();
    world.towerActiveVortex = r.getBool();
    world.towerActiveNebula = r.getBool();
    world.towerActiveStardust = r.getBool();
    world.lunarApocalypseIsUp = r.getBool();

    if (world.version >= 170) {
        world.partyManual = r.getBool();
        world.partyGenuine = r.getBool();
        world.partyCooldown = r.getUint32();
        for (int i = r.getUint32(); i > 0; --i) {
            world.partyingNPCs.push_back(r.getUint32());
        }
    }
    if (world.version >= 174) {
        world.sandstormActive = r.getBool();
        world.sandstormTimeLeft = r.getUint32();
        world.sandstormSeverity = r.getFloat32();
        world.sandstormIntendedSeverity = r.getFloat32();
    }
    if (world.version >= 178) {
        world.savedBartender = r.getBool();
        world.downedInvasionTier1 = r.getBool();
        world.downedInvasionTier2 = r.getBool();
        world.downedInvasionTier3 = r.getBool();
    }
    if (world.version < 225) {
        return;
    }
    world.mushroomStyle = r.getUint8();
    world.underworldStyle2 = r.getUint8();
    world.forestStyle2 = r.getUint8();
    world.forestStyle3 = r.getUint8();
    world.forestStyle4 = r.getUint8();
    world.combatBookUsed = r.getBool();
    world.lanternNightCooldown = r.getUint32();
    world.lanternNightGenuine = r.getBool();
    world.lanternNightManual = r.getBool();
    world.lanternNightNextIsGenuine = r.getBool();
    for (int i = r.getUint32(); i > 0; --i) {
        world.treeTopVariations.push_back(r.getUint32());
    }
    world.forceHalloween = r.getBool();
    world.forceChristmas = r.getBool();
    world.copperVariant = r.getUint32();
    world.ironVariant = r.getUint32();
    world.silverVariant = r.getUint32();
    world.goldVariant = r.getUint32();
    world.boughtCat = r.getBool();
    world.boughtDog = r.getBool();
    world.boughtBunny = r.getBool();

    if (world.version >= 223) {
        world.downedEmpressOfLight = r.getBool();
        world.downedQueenSlime = r.getBool();
    }
    if (world.version >= 240) {
        world.downedDeerclops = r.getBool();
    }
    if (world.version < 269) {
        return;
    }
    world.unlockedSlimeBlue = r.getBool();
    world.unlockedMerchant = r.getBool();
    world.unlockedDemolitionist = r.getBool();
    world.unlockedPartyGirl = r.getBool();
    world.unlockedDyeTrader = r.getBool();
    world.unlockedTruffle = r.getBool();
    world.unlockedArmsDealer = r.getBool();
    world.unlockedNurse = r.getBool();
    world.unlockedPrincess = r.getBool();
    world.combatBookVolumeTwoUsed = r.getBool();
    world.peddlersSatchelUsed = r.getBool();
    world.unlockedSlimeGreen = r.getBool();
    world.unlockedSlimeOld = r.getBool();
    world.unlockedSlimePurple = r.getBool();
    world.unlockedSlimeRainbow = r.getBool();
    world.unlockedSlimeRed = r.getBool();
    world.unlockedSlimeYellow = r.getBool();
    world.unlockedSlimeCopper = r.getBool();
    world.fastForwardTimeToDusk = r.getBool();
    world.moondialCooldown = r.getUint8();
}

void readWorldFile(const std::string &data)
{
    Reader r{data};
    World world{};
    readProperties(r, world);

#ifndef __EMSCRIPTEN__
    printWorld(world);
#endif
}

#ifndef __EMSCRIPTEN__
#include <fstream>
#include <iostream>
#include <sstream>

int main()
{
    std::ifstream in("/path/to/Test_World.wld", std::ios::binary);
    std::ostringstream sstr;
    sstr << in.rdbuf();
    std::string data{sstr.str()};
    readWorldFile(data);
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

void printWorld(World &world)
{
    DUMP(version);
    DUMP(revision);
    DUMP(isFavorite);
    DUMP(framedTiles.size());

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
    DUMP(enemyKillTallies.size());
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
}
#endif
