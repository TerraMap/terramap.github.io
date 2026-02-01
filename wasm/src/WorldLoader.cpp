#include "WorldLoader.h"

#include "Reader.h"
#include <chrono>
#include <format>

bool isValidWorldSize(const World &world)
{
    return world.width > 0 && world.height > 0 && world.width < 33600 &&
           world.height < 9600;
}

std::string parseBinaryTime(uint64_t ticks)
{
    uint64_t ms = (ticks & 0x3fffffffffffffffull) / 10000 - 62135596800000ull;
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
            world.guid += std::format("{:02x}", r.getUint8());
        }
    }
    world.id = r.getUint32();
    world.left = r.getUint32();
    world.right = r.getUint32();
    world.top = r.getUint32();
    world.bottom = r.getUint32();
    world.height = r.getUint32();
    world.width = r.getUint32();
    if (!isValidWorldSize(world)) {
        return;
    }
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
        if (world.version >= 302) {
            world.skyblock = r.getBool();
        }
    } else if (world.version >= 112) {
        world.gameMode = r.getBool() ? 1 : 0;
    }
    if (world.version >= 141) {
        world.creationTime = parseBinaryTime(r.getUint64());
    }
    if (world.version >= 284) {
        world.lastPlayed = parseBinaryTime(r.getUint64());
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
    if (world.version >= 289) {
        for (int i = r.getUint16(); i > 0; --i) {
            world.claimableBanners.push_back(r.getUint16());
        }
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
    world.unlockedNerdySlime = r.getBool();
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
    world.unlockedCoolSlime = r.getBool();
    world.unlockedElderSlime = r.getBool();
    world.unlockedClumsySlime = r.getBool();
    world.unlockedDivaSlime = r.getBool();
    world.unlockedSurlySlime = r.getBool();
    world.unlockedMysticSlime = r.getBool();
    world.unlockedSquireSlime = r.getBool();
    world.fastForwardTimeToDusk = r.getBool();
    world.moondialCooldown = r.getUint8();
    if (world.version < 315) {
        return;
    }
    world.endlessHalloween = r.getBool();
    world.endlessChristmas = r.getBool();
    world.vampirism = r.getBool();
    world.infectedWorld = r.getBool();
    world.meteorShowerCount = r.getUint32();
    world.coinRain = r.getUint32();
    world.teamBasedSpawns = r.getBool();
    for (int i = r.getUint8(); i > 0; --i) {
        int x = r.getUint16();
        int y = r.getUint16();
        world.extraSpawnPoints.push_back({x, y});
    }
    world.dualDungeons = r.getBool();
    world.worldGenManifest = r.getString();
}

void readTiles(Reader &r, World &world)
{
    world.initTiles();
    for (int x = 0; x < world.width; ++x) {
        for (int y = 0, rle = 0; y < world.height; ++y) {
            Tile &tile = world.getTile(x, y);
            if (rle > 0) {
                tile = world.getTile(x, y - 1);
                --rle;
                continue;
            }
            std::array flags{0, 0, 0, 0};
            for (auto &flag : flags) {
                flag = r.getUint8();
                if ((flag & 0x01) == 0) {
                    break;
                }
            }
            if ((flags[0] & 0x02) == 0) {
                tile.blockId = -1;
            } else {
                if ((flags[0] & 0x20) == 0) {
                    tile.blockId = r.getUint8();
                } else {
                    tile.blockId = r.getUint16();
                }
                if (world.framedTiles[tile.blockId]) {
                    tile.frameX = static_cast<int16_t>(r.getUint16());
                    tile.frameY = static_cast<int16_t>(r.getUint16());
                }
                if ((flags[2] & 0x08) != 0) {
                    tile.blockPaint = r.getUint8();
                }
                tile.slope = static_cast<Slope>((flags[1] >> 4) & 0x07);
            }
            if ((flags[0] & 0x04) == 0) {
                tile.wallId = 0;
            } else {
                tile.wallId = r.getUint8();
                if ((flags[2] & 0x10) != 0) {
                    tile.wallPaint = r.getUint8();
                }
            }
            if ((flags[0] & 0x18) == 0x08) {
                tile.liquid =
                    (flags[2] & 0x80) == 0 ? Liquid::water : Liquid::shimmer;
            } else if ((flags[0] & 0x18) == 0x10) {
                tile.liquid = Liquid::lava;
            } else if ((flags[0] & 0x18) == 0x18) {
                tile.liquid = Liquid::honey;
            }
            if (tile.liquid != Liquid::none) {
                tile.liquidAmount = r.getUint8();
            }
            if ((flags[2] & 0x40) != 0) {
                tile.wallId |= r.getUint8() << 8;
            }
            tile.wireRed = (flags[1] & 0x02) != 0;
            tile.wireBlue = (flags[1] & 0x04) != 0;
            tile.wireGreen = (flags[1] & 0x08) != 0;
            tile.wireYellow = (flags[2] & 0x20) != 0;
            tile.actuator = (flags[2] & 0x02) != 0;
            tile.actuated = (flags[2] & 0x04) != 0;
            tile.echoCoatBlock = (flags[3] & 0x02) != 0;
            tile.echoCoatWall = (flags[3] & 0x04) != 0;
            tile.illuminantBlock = (flags[3] & 0x08) != 0;
            tile.illuminantWall = (flags[3] & 0x10) != 0;
            if ((flags[0] & 0x40) != 0) {
                rle = r.getUint8();
            } else if ((flags[0] & 0x80) != 0) {
                rle = r.getUint16();
            }
        }
    }
}

void readChests(Reader &r, World &world)
{
    world.chests.resize(r.getUint16());
    int chestSlots = world.version >= 294 ? 0 : r.getUint16();
    for (Chest &chest : world.chests) {
        chest.x = r.getUint32();
        chest.y = r.getUint32();
        chest.name = r.getString();
        if (world.version >= 294) {
            chestSlots = r.getUint32();
        }
        for (int slot = 0; slot < chestSlots; ++slot) {
            int stack = r.getUint16();
            if (stack > 0) {
                chest.items.resize(slot + 1);
                Item &item = chest.items[slot];
                item.id = r.getUint32();
                item.stack = stack;
                item.prefix = r.getUint8();
            }
        }
    }
}

void readSigns(Reader &r, World &world)
{
    world.signs.resize(r.getUint16());
    for (Sign &sign : world.signs) {
        sign.text = r.getString();
        sign.x = r.getUint32();
        sign.y = r.getUint32();
    }
}

void readNPCs(Reader &r, World &world)
{
    if (world.version >= 268) {
        for (int i = r.getUint32(); i > 0; --i) {
            world.shimmeredNPCs.push_back(r.getUint32());
        }
    }
    // Town NPCs.
    while (r.getBool()) {
        NPC npc{};
        if (world.version >= 190) {
            npc.id = r.getUint32();
            switch (npc.id) {
                // clang-format off
                case 17: npc.type = "Merchant"; break;
                case 18: npc.type = "Nurse"; break;
                case 19: npc.type = "Arms Dealer"; break;
                case 20: npc.type = "Dryad"; break;
                case 22: npc.type = "Guide"; break;
                case 37: npc.type = "Old Man"; break;
                case 38: npc.type = "Demolitionist"; break;
                case 54: npc.type = "Clothier"; break;
                case 107: npc.type = "Goblin Tinkerer"; break;
                case 108: npc.type = "Wizard"; break;
                case 124: npc.type = "Mechanic"; break;
                case 142: npc.type = "Santa Claus"; break;
                case 160: npc.type = "Truffle"; break;
                case 178: npc.type = "Steampunker"; break;
                case 207: npc.type = "Dye Trader"; break;
                case 208: npc.type = "Party Girl"; break;
                case 209: npc.type = "Cyborg"; break;
                case 227: npc.type = "Painter"; break;
                case 228: npc.type = "Witch Doctor"; break;
                case 229: npc.type = "Pirate"; break;
                case 353: npc.type = "Stylist"; break;
                case 369: npc.type = "Angler"; break;
                case 441: npc.type = "Tax Collector"; break;
                case 550: npc.type = "Tavernkeep"; break;
                case 588: npc.type = "Golfer"; break;
                case 633: npc.type = "Zoologist"; break;
                case 637: npc.type = "Town Cat"; break;
                case 638: npc.type = "Town Dog"; break;
                case 656: npc.type = "Town Bunny"; break;
                case 663: npc.type = "Princess"; break;
                // clang-format on
            }
        } else {
            npc.type = r.getString();
        }
        npc.name = r.getString();
        npc.x = r.getFloat32() / 16;
        npc.y = r.getFloat32() / 16;
        npc.isHomeless = r.getBool();
        npc.homeX = r.getUint32();
        npc.homeY = r.getUint32();
        if (world.version >= 213 && r.getBool()) {
            npc.variation = r.getUint32();
        }
        if (world.version >= 315) {
            npc.homelessDespawn = r.getBool();
        }
        world.npcs.push_back(std::move(npc));
    }
    if (world.version >= 140) {
        // Enemies.
        while (r.getBool()) {
            NPC npc{};
            if (world.version >= 190) {
                npc.id = r.getUint32();
            } else {
                npc.type = r.getString();
            }
            npc.x = r.getFloat32() / 16;
            npc.y = r.getFloat32() / 16;
            world.npcs.push_back(std::move(npc));
        }
    }
}

void readMannequin(TileEntity &entity, Reader &r)
{
    uint8_t itemMask = r.getUint8();
    uint8_t dyeMask = r.getUint8();
    entity.items.resize(8);
    for (int i = 0; i < 8; ++i) {
        if ((itemMask & (1 << i)) != 0) {
            Item &item = entity.items[i];
            item.id = r.getUint16();
            item.prefix = r.getUint8();
            item.stack = r.getUint16();
        }
    }
    entity.dyes.resize(8);
    for (int i = 0; i < 8; ++i) {
        if ((dyeMask & (1 << i)) != 0) {
            Item &item = entity.dyes[i];
            item.id = r.getUint16();
            item.prefix = r.getUint8();
            item.stack = r.getUint16();
        }
    }
}

void readHatRack(TileEntity &entity, Reader &r)
{
    uint8_t mask = r.getUint8();
    entity.items.resize(2);
    for (Item &item : entity.items) {
        if ((mask & 1) != 0) {
            item.id = r.getUint16();
            item.prefix = r.getUint8();
            item.stack = r.getUint16();
        }
        mask >>= 1;
    }
    entity.dyes.resize(2);
    for (Item &item : entity.dyes) {
        if ((mask & 1) != 0) {
            item.id = r.getUint16();
            item.prefix = r.getUint8();
            item.stack = r.getUint16();
        }
        mask >>= 1;
    }
}

void readTileEntities(Reader &r, World &world)
{
    if (world.version < 140) {
        return;
    }
    for (int i = r.getUint32(); i > 0; --i) {
        TileEntity entity{};
        entity.type = r.getUint8();
        entity.id = r.getUint32();
        entity.x = r.getUint16();
        entity.y = r.getUint16();
        switch (entity.type) {
        case 0: // Target dummy.
            r.getUint16();
            break;
        case 1: // Item frame.
        case 4: // Weapon rack.
        case 6: // Plate.
        {
            Item item;
            item.id = r.getUint16();
            item.prefix = r.getUint8();
            item.stack = r.getUint16();
            entity.items.push_back(item);
            break;
        }
        case 2: // Logic sensor.
            entity.sensorType = r.getUint8();
            entity.sensorActive = r.getBool();
            break;
        case 3: // (Wo)Mannequin.
            readMannequin(entity, r);
            break;
        case 5: // Hat rack.
            readHatRack(entity, r);
            break;
        }
        world.tileEntities.push_back(std::move(entity));
    }
}

World readWorldFile(const std::string &data)
{
    Reader r{data};
    World world{};
    readProperties(r, world);
    if (!isValidWorldSize(world)) {
        return world;
    }
    readTiles(r, world);
    readChests(r, world);
    readSigns(r, world);
    readNPCs(r, world);
    readTileEntities(r, world);
    return world;
}
