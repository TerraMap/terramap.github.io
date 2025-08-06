#include "TileColor.h"
#include "WorldLoader.h"

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>

#define DUMP(field) result.set(#field, world.field)
#define DUMP_ARRAY(field)                                                      \
    result.set(                                                                \
        #field,                                                                \
        emscripten::val::array(world.field.begin(), world.field.end()))

emscripten::val dumpWorld(const World &world)
{
    auto result = emscripten::val::object();
#else
#include <fstream>
#include <iostream>
#include <sstream>

#define DUMP(field) std::cout << #field " " << world.field << '\n'
#define DUMP_ARRAY(field)                                                      \
    do {                                                                       \
        std::cout << #field " [";                                              \
        for (auto val : world.field) {                                         \
            std::cout << val << ',';                                           \
        };                                                                     \
        std::cout << "]\n";                                                    \
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

public:
    emscripten::val loadWorldFile(const std::string &data)
    {
        world = readWorldFile(data);
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
};

EMSCRIPTEN_BINDINGS(terramap)
{
    emscripten::class_<Loader>("Loader")
        .constructor()
        .function("loadWorldFile", &Loader::loadWorldFile)
        .function("renderToCanvas", &Loader::renderToCanvas);
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
