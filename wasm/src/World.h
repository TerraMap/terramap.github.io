#ifndef WORLD_H
#define WORLD_H

#include <array>
#include <string>
#include <vector>

class World
{
public:
    int version;
    int revision;
    bool isFavorite;
    std::vector<bool> framedTiles;

    std::string name;
    std::string seed;
    std::string generatorVersion;
    std::string guid;
    int id;
    int left;
    int right;
    int top;
    int bottom;
    int height;
    int width;
    int gameMode;
    bool drunkWorld;
    bool forTheWorthy;
    bool celebrationmk10;
    bool theConstant;
    bool notTheBees;
    bool dontDigUp;
    bool noTraps;
    bool getFixedBoi;
    std::string creationTime;

    int moonType;
    std::array<int, 3> treeStyleCoords;
    std::array<int, 4> treeStyles;
    std::array<int, 3> caveStyleCoords;
    std::array<int, 4> caveStyles;
    int iceStyle;
    int jungleStyle;
    int underworldStyle;
    std::array<int, 2> spawn;
    double undergroundLevel;
    double cavernLevel;
    double gameTime;
    bool isDay;
    int moonPhase;
    bool bloodMoon;
    bool eclipse;
    std::array<int, 2> dungeon;
    bool isCrimson;

    bool downedEyeOfCthulu;
    bool downedEaterOfWorlds;
    bool downedSkeletron;
    bool downedQueenBee;
    bool downedTheDestroyer;
    bool downedTheTwins;
    bool downedSkeletronPrime;
    bool downedAnyHardmodeBoss;
    bool downedPlantera;
    bool downedGolem;
    bool downedSlimeKing;
    bool savedGoblinTinkerer;
    bool savedWizard;
    bool savedMechanic;
    bool defeatedGoblinInvasion;
    bool downedClown;
    bool defeatedFrostLegion;
    bool defeatedPirates;

    bool brokeAShadowOrb;
    bool meteorSpawned;
    int shadowOrbsBroken;
    int altarsSmashed;
    bool hardMode;
    bool partyOfDoom;
    int goblinInvasionDelay;
    int goblinInvasionSize;
    int goblinInvasionType;
    double goblinInvasionX;
    double slimeRainTime;
    int sundialCooldown;
    bool raining;
    int rainTimeLeft;
    double maxRain;
    int cobaltVariant;
    int mythrilVariant;
    int adamantiteVariant;
    int forestStyle1;
    int corruptionStyle;
    int undergroundJungleStyle;
    int snowStyle;
    int hallowStyle;
    int crimsonStyle;
    int desertStyle;
    int oceanStyle;
    int cloudBackground;
    int numberOfClouds;
    double windSpeed;

    std::vector<std::string> anglersFinishedDailyQuest;
    bool savedAngler;
    int anglerQuest;
    bool savedStylist;
    bool savedTaxCollector;
    bool savedGolfer;
    int invasionStartSize;
    int cultistDelay;
    std::vector<int> enemyKillTallies;
    bool fastForwardTimeToDawn;

    bool downedFishron;
    bool downedMartians;
    bool downedLunaticCultist;
    bool downedMoonlord;
    bool downedHalloweenPumpking;
    bool downedHalloweenMourningWood;
    bool downedChristmasIceQueen;
    bool downedChristmasSantaNK1;
    bool downedChristmasEverscream;
    bool downedTowerSolar;
    bool downedTowerVortex;
    bool downedTowerNebula;
    bool downedTowerStardust;
    bool towerActiveSolar;
    bool towerActiveVortex;
    bool towerActiveNebula;
    bool towerActiveStardust;
    bool lunarApocalypseIsUp;

    bool partyManual;
    bool partyGenuine;
    int partyCooldown;
    std::vector<int> partyingNPCs;
    bool sandstormActive;
    int sandstormTimeLeft;
    double sandstormSeverity;
    double sandstormIntendedSeverity;
    bool savedBartender;
    bool downedInvasionTier1;
    bool downedInvasionTier2;
    bool downedInvasionTier3;
    int mushroomStyle;
    int underworldStyle2;
    int forestStyle2;
    int forestStyle3;
    int forestStyle4;
    bool combatBookUsed;
    int lanternNightCooldown;
    bool lanternNightGenuine;
    bool lanternNightManual;
    bool lanternNightNextIsGenuine;
    std::vector<int> treeTopVariations;
    bool forceHalloween;
    bool forceChristmas;
    int copperVariant;
    int ironVariant;
    int silverVariant;
    int goldVariant;
    bool boughtCat;
    bool boughtDog;
    bool boughtBunny;

    bool downedEmpressOfLight;
    bool downedQueenSlime;
    bool downedDeerclops;
    bool unlockedSlimeBlue;
    bool unlockedMerchant;
    bool unlockedDemolitionist;
    bool unlockedPartyGirl;
    bool unlockedDyeTrader;
    bool unlockedTruffle;
    bool unlockedArmsDealer;
    bool unlockedNurse;
    bool unlockedPrincess;
    bool combatBookVolumeTwoUsed;
    bool peddlersSatchelUsed;
    bool unlockedSlimeGreen;
    bool unlockedSlimeOld;
    bool unlockedSlimePurple;
    bool unlockedSlimeRainbow;
    bool unlockedSlimeRed;
    bool unlockedSlimeYellow;
    bool unlockedSlimeCopper;
    bool fastForwardTimeToDusk;
    int moondialCooldown;
};

#endif // WORLD_H
