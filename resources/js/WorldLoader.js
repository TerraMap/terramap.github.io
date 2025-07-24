importScripts('MapHelper.js');
importScripts('DataStream.js');
importScripts('settings.js');

self.addEventListener('message', function(e) {
    self.start(e.data);
}, false);

var start = function(file) {
    var fileReader = new FileReaderSync();

    self.postMessage({
        'status': "Reading world file..."
    });

    var buffer = fileReader.readAsArrayBuffer(file);

    var ds = new DataStream(buffer);

    ds.endianness = DataStream.LITTLE_ENDIAN;

    var world = {};

    self.postMessage({
        'status': "Loading world file..."
    });

    readWorldFile(ds, world);
};

function readWorldFile(reader, world) {
    readFileFormatHeader(reader, world);
    readProperties(reader, world);
    readTiles(reader, world);
    readChests(reader, world);
    readSigns(reader, world);
    readNpcs(reader, world);
    readTileEntities(reader, world);

    self.postMessage({
        'status': "Done.",
        'done': true
    });
    console.log(world)
}

function readFileFormatHeader(reader, world) {
    self.postMessage({
        'status': "Reading world version..."
    });

    world.version = reader.readInt32();

    self.postMessage({
        'status': "Reading world header...",
        'version': world.version,
    });

    // read file metadata
    // TODO: implement readUint64()
    reader.readUint32();
    reader.readUint32();

    world.revision = reader.readUint32();

    // isFavorite
    reader.readUint32();
    reader.readUint32();

    // read positions
    var i = 0;

    var positionsLength = reader.readInt16();
    for (i = 0; i < positionsLength; i++) {
        reader.readInt32();
    }

    // read importances
    var importanceLength = reader.readInt16();
    world.importance = new Array(importanceLength);
    var b = 0;
    var b2 = 128;
    for (i = 0; i < importanceLength; i++) {
        if (b2 == 128) {
            b = reader.readUint8();
            b2 = 1;
        } else {
            b2 = b2 << 1;
        }

        if ((b & b2) == b2) {
            world.importance[i] = true;
        }
    }
}

function readProperties(reader, world) {
    world.name = readString(reader);

    world.seed = readString(reader);

    // world.worldGeneratorVersion
    reader.readUint32();
    reader.readUint32();

    // UUID
    for (i = 0; i < 16; i++) {
        reader.readUint8();
    }

    world.id = reader.readInt32();

    world.left = reader.readInt32();
    world.right = reader.readInt32();
    world.top = reader.readInt32();
    world.bottom = reader.readInt32();

    world.height = reader.readInt32();
    world.width = reader.readInt32();
    if (world.version >= 209) {
        world.expertMode = world.gameMode = reader.readInt32();
        if (world.version >= 222) {
            world.drunkWorld = world.drunkMode = reader.readUint8();
        }
        if (world.version >= 227) {
            world.getGoodWorld = reader.readUint8();
        }
        if (world.version >= 238) {
            world.tenthAnniversaryWorld = reader.readUint8();
        }
    } else {
        if (world.version >= 112) {
            world.expertMode = world.gameMode = (reader.readUint8() ? 1 : 0);
        } else {
            world.expertMode = world.gameMode = 0;
        }
        if (world.version == 208 && reader.readUint8()) {
            world.expertMode = world.gameMode = 2;
        }
    }

    if (world.version >= 239) {
        world.dontStarveWorld = reader.readUint8();
    }
    if (world.version >= 241) {
        world.notTheBeesWorld = reader.readUint8();
    }

    if (world.version >= 249) {
        world.remixWorld = reader.readUint8();
    }
    if (world.version >= 266) {
        world.noTrapsWorld = reader.readUint8();
    }
    if (world.version >= 267) {
        world.zenithWorld = reader.readUint8();
    }

    // creation time (Int64)
    reader.readInt32();
    reader.readInt32();

    world.moonType = reader.readUint8();

    world.treeTypeXCoordinates = reader.readInt32Array(3);
    world.treeStyles = reader.readInt32Array(4);
    world.caveBackXCoordinates = reader.readInt32Array(3);
    world.caveBackStyles = reader.readInt32Array(4);
    world.iceBackStyle = reader.readInt32();
    world.jungleBackStyle = reader.readInt32();
    world.hellBackStyle = reader.readInt32();

    world.spawnX = reader.readInt32();
    world.spawnY = reader.readInt32();

    world.worldSurfaceY = reader.readFloat64();
    world.rockLayerY = reader.readFloat64();
    world.gameTime = reader.readFloat64();
    world.isDay = reader.readUint8() > 0;
    world.moonPhase = reader.readInt32();
    world.bloodMoon = reader.readUint8() > 0;
    world.eclipse = reader.readUint8() > 0;
    world.dungeonX = reader.readInt32();
    world.dungeonY = reader.readInt32();
    world.crimsonWorld = reader.readUint8() > 0;
    world.killedEyeOfCthulu = reader.readUint8() > 0;
    world.killedEaterOfWorlds = reader.readUint8() > 0;
    world.killedSkeletron = reader.readUint8() > 0;
    world.killedQueenBee = reader.readUint8() > 0;
    world.killedTheDestroyer = reader.readUint8() > 0;
    world.killedTheTwins = reader.readUint8() > 0;
    world.killedSkeletronPrime = reader.readUint8() > 0;
    world.killedAnyHardmodeBoss = reader.readUint8() > 0;
    world.killedPlantera = reader.readUint8() > 0;
    world.killedGolem = reader.readUint8() > 0;
    world.killedSlimeKing = reader.readUint8() > 0;
    world.savedGoblinTinkerer = reader.readUint8() > 0;
    world.savedWizard = reader.readUint8() > 0;
    world.savedMechanic = reader.readUint8() > 0;
    world.defeatedGoblinInvasion = reader.readUint8() > 0;
    world.killedClown = reader.readUint8() > 0;
    world.defeatedFrostLegion = reader.readUint8() > 0;
    world.defeatedPirates = reader.readUint8() > 0;
    world.brokeAShadowOrb = reader.readUint8() > 0;
    world.meteorSpawned = reader.readUint8() > 0;
    world.shadowOrbsbrokenmod3 = reader.readUint8();
    world.altarsSmashed = reader.readInt32();
    world.hardMode = reader.readUint8() > 0;
    world.afterPartyOfDoom = reader.readUint8() > 0;
    world.goblinInvasionDelay = reader.readInt32();
    world.goblinInvasionSize = reader.readInt32();
    world.goblinInvasionType = reader.readInt32();
    world.goblinInvasionX = reader.readFloat64();
    world.slimeRainTime = reader.readFloat64();
    world.sundialCooldown = reader.readUint8();
    world.isRaining = reader.readUint8() > 0;
    world.rainTime = reader.readInt32();
    world.maxRain = reader.readFloat32();
    world.tier1OreID = reader.readInt32();
    world.tier2OreID = reader.readInt32();
    world.tier3OreID = reader.readInt32();
    world.treeStyle = reader.readUint8();
    world.corruptionStyle = reader.readUint8();
    world.jungleStyle = reader.readUint8();
    world.snowStyle = reader.readUint8();
    world.hallowStyle = reader.readUint8();
    world.crimsonStyle = reader.readUint8();
    world.desertStyle = reader.readUint8();
    world.oceanStyle = reader.readUint8();
    world.cloudBackground = reader.readInt32();
    world.numberofClouds = reader.readInt16();
    world.windSpeed = reader.readFloat32();

    world.anglerWhoFinishedTodayCount = reader.readInt32();
    world.anglersWhoFinishedToday = [];

    for (i = world.anglerWhoFinishedTodayCount; i > 0; i--) {
        world.anglersWhoFinishedToday.push(readString(reader));
    }

    world.savedAngler = reader.readUint8() > 0;
    world.anglerQuest = reader.readInt32();
    world.savedStylist = reader.readUint8() > 0;
    world.savedTaxCollector = reader.readUint8() > 0;
    if (world.version >= 201) {
        world.savedGolfer = reader.readUint8() > 0;
    }

    world.invasionSizeStart = reader.readInt32();
    world.tempCultistDelay = reader.readInt32();

    let killedMobs = reader.readInt16();
    for (var j = 0; j < killedMobs; j++) {
        if (j < 688) {
            //this.NpcKillCount[j] = reader.readInt32();
            reader.readInt32();
        } else {
            reader.readInt32();
        }
    }

    world.fastForwardTime = reader.readUint8() > 0;

    world.downedFishron = reader.readUint8() > 0;
    world.downedMartians = reader.readUint8() > 0;
    world.downedAncientCultist = reader.readUint8() > 0;
    world.downedMoonlord = reader.readUint8() > 0;
    world.downedHalloweenKing = reader.readUint8() > 0;
    world.downedHalloweenTree = reader.readUint8() > 0;
    world.downedChristmasIceQueen = reader.readUint8() > 0;
    world.downedChristmasSantank = reader.readUint8() > 0;
    world.downedChristmasTree = reader.readUint8() > 0;
    world.downedTowerSolar = reader.readUint8() > 0;
    world.downedTowerVortex = reader.readUint8() > 0;
    world.downedTowerNebula = reader.readUint8() > 0;
    world.downedTowerStardust = reader.readUint8() > 0;

    world.towerActiveSolar = reader.readUint8() > 0;
    world.towerActiveVortex = reader.readUint8() > 0;
    world.towerActiveNebula = reader.readUint8() > 0;
    world.towerActiveStardust = reader.readUint8() > 0;
    world.lunarApocalypseIsUp = reader.readUint8() > 0;

    world.partyManual = reader.readUint8() > 0;
    world.partyGenuine = reader.readUint8() > 0;
    world.partyCooldown = reader.readInt32();

    var num3 = world.partyingNPCS = reader.readInt32();
    for (var k = 0; k < num3; k++) {
        reader.readInt32();
    }

    world.sandstormHappening = reader.readUint8() > 0;
    world.sandstormTimeLeft = reader.readInt32();

    world.sandstormSeverity = reader.readFloat32();
    world.sandstormIntendedSeverity = reader.readFloat32();

    world.savedBartender = reader.readUint8() > 0;

    world.downedInvasionTier1 = reader.readUint8() > 0;
    world.downedInvasionTier2 = reader.readUint8() > 0;
    world.downedInvasionTier3 = reader.readUint8() > 0;

    // v1.4 Journey's End new stuff
    // world bg stuff
    if (world.version > 194) {
        reader.readUint8();
    }
    if (world.version >= 215) {
        reader.readUint8();
    }
    // tree bg stuff
    if (world.version > 195) {
        reader.readUint8();
        reader.readUint8();
        reader.readUint8();
    }
    if (world.version >= 204) {
        world.combatBookWasUsed = reader.readUint8() > 0;
    }
    // tempLanternNight stuff
    if (world.version >= 207) {
        reader.readInt32();
        reader.readUint8() > 0;
        reader.readUint8() > 0;
        reader.readUint8() > 0;
    }

    if (world.version >= 211) {
        // tree tops info
        var num = reader.readInt32();
        num2 = 0;
        while (num2 < num && num2 < 13) {
            reader.readInt32();
            num2++;
        }
    }
    if (world.version >= 212) {
        //forceHalloweenForToday
        reader.readUint8() > 0;
        // forceXMasForToday
        reader.readUint8() > 0;
    }
    if (world.version >= 216) {
        world.savedOreTiers = {};
        world.savedOreTiers.copper = reader.readInt32();
        world.savedOreTiers.iron = reader.readInt32();
        world.savedOreTiers.silver = reader.readInt32();
        world.savedOreTiers.gold = reader.readInt32();
    }
    if (world.version >= 217) {
        world.boughtCat = reader.readUint8() > 0;
        world.boughtDog = reader.readUint8() > 0;
        world.boughtBunny = reader.readUint8() > 0;
    }
    if (world.version >= 223) {
        world.downedEmpressOfLight = reader.readUint8() > 0;
        world.downedQueenSlime = reader.readUint8() > 0;
    }
    if (world.version >= 240) {
        world.downedDeerclops = reader.readUint8() > 0;
    }

    if (world.version >= 250) {
        world.unlockedSlimeBlueSpawn = reader.readUint8() > 0;
    }

    if (world.version >= 251) {
        world.unlockedMerchantSpawn = reader.readUint8() > 0;
        world.unlockedDemolitionistSpawn = reader.readUint8() > 0;
        world.unlockedPartyGirlSpawn = reader.readUint8() > 0;
        world.unlockedDyeTraderSpawn = reader.readUint8() > 0;
        world.unlockedTruffleSpawn = reader.readUint8() > 0;
        world.unlockedArmsDealerSpawn = reader.readUint8() > 0;
        world.unlockedNurseSpawn = reader.readUint8() > 0;
        world.unlockedPrincessSpawn = reader.readUint8() > 0;
    }

    if (world.version >= 259) world.combatBookVolumeTwoWasUsed = reader.readUint8() > 0;
    if (world.version >= 260) world.peddlersSatchelWasUsed = reader.readUint8() > 0;
    if (world.version >= 261)
    {
      reader.readUint8() > 0;
      reader.readUint8() > 0;
      reader.readUint8() > 0;
      reader.readUint8() > 0;
      reader.readUint8() > 0;
      reader.readUint8() > 0;
      reader.readUint8() > 0;
    }
    if (world.version >= 264)
    {
      reader.readUint8() > 0;
      reader.readUint8();
    }

    var hellLevel = ((world.height - 230) - world.worldSurfaceY) / 6;
    hellLevel = hellLevel * 6 + world.worldSurfaceY - 5;
    world.hellLayerY = hellLevel;
}

function readTiles(reader, world) {
    self.postMessage({
        'status': "Reading world tiles...",
        'world': world,
    });

    // 	world.tiles = [world.width, world.height];
    world.totalTileCount = world.width * world.height;

    var tilesProcessed = 0;

    var color;
    var num2 = -1;
    var tile = {};
    var b3 = 0;
    var b4 = 0;
    var k = 0;
    var x = 0;
    var y = 0;

    // world.tiles = new Array(world.width);

    var tiles = [];

    for (x = 0; x < world.width; x++) {
        // world.tiles[x] = new Array(world.height);

        for (y = 0; y < world.height; y++) {
            num2 = -1;
            let b2 = 0;
            let b = 0;
            let tile = {};
            let b3 = reader.readUint8();
            let flag = false;
            if ((b3 & 1) == 1) {
                flag = true;
                b2 = reader.readUint8();
            }
            let flag2 = false;
            if (flag && (b2 & 1) == 1) {
                flag2 = true;
                b = reader.readUint8();
            }
            if (flag2 && (b & 1) == 1) {
                b4 = reader.readUint8();
            }
            b4 = 0;
            if ((b3 & 2) == 2) {
                tile.IsActive = true;
                if ((b3 & 32) == 32) {
                    b4 = reader.readUint8();
                    num2 = reader.readUint8();
                    num2 = (num2 << 8 | b4);
                } else {
                    num2 = reader.readUint8();
                }

                tile.Type = num2;

                if (world.importance[num2]) {
                    tile.TextureU = reader.readInt16();
                    tile.TextureV = reader.readInt16();
                    if (tile.Type == 144) {
                        tile.TextureV = 0;
                    }
                } else {
                    tile.TextureU = -1;
                    tile.TextureV = -1;
                }
                if ((b & 8) == 8) {
                    // 	tile.ColorValue = reader.readUint8();
                    reader.readUint8();
                }
            }
            if ((b3 & 4) == 4) {
                tile.WallType = reader.readUint8();
                tile.IsWallPresent = true;
                if ((b & 16) == 16) {
                    tile.WallColor = reader.readUint8();
                    tile.IsWallColorPresent = true;
                }
            }
            b4 = (b3 & 0x18) >> 3;
            if (b4 !== 0) {
                tile.IsLiquidPresent = true;
                tile.LiquidAmount = reader.readUint8();
                if ((b & 128) == 128) {
                    tile.Shimmer = true;
                }
                if (b4 > 1) {
                    if (b4 == 2) {
                        tile.IsLiquidLava = true;
                    } else {
                        tile.IsLiquidHoney = true;
                    }
                }
            }
            if (b2 > 1) {
                if ((b2 & 2) == 2) {
                    tile.IsRedWirePresent = true;
                }
                if ((b2 & 4) == 4) {
                    tile.IsGreenWirePresent = true;
                }
                if ((b2 & 8) == 8) {
                    tile.IsBlueWirePresent = true;
                }
                b4 = (b2 & 0x70) >> 4;
            }
            if (b > 0) {
                if ((b & 2) == 2) {
                    tile.IsActuatorPresent = true;
                }
                if ((b & 4) == 4) {
                    tile.IsActive = false;
                }
                if ((b & 0x20) == 32) {
                    tile.IsYellowWirePresent = true;
                }
                if ((b & 0x40) == 64) {
                    b4 = reader.readUint8();
                    tile.WallType = (b4 << 8 | tile.WallType);
                }
            }
            b4 = (b3 & 192) >> 6;
            k = 0;
            switch ((b3 & 192) >> 6) {
            case 0:
                k = 0;
                break;
            case 1:
                k = reader.readUint8();
                break;
            default:
                k = reader.readUint16();
                break;
            }

            tiles.push(tile);

            while (k > 0) {
                y++;

                tiles.push(tile);

                k--;
            }
        }

        tilesProcessed += world.height;

        if (x % 2 == 1) {
            self.postMessage({
                'status': `Reading tile ${tilesProcessed.toLocaleString()} of ${world.totalTileCount.toLocaleString()}`,
                // 'tilesProcessed': tilesProcessed,
                // 'totalTileCount': world.totalTileCount,
                'x': x - 1,
                'tiles': tiles,
            });
            tiles = [];
        }
    }
}

function readChests(reader, world) {
    var chests = [];

    var num = reader.readInt16();
    var num2 = reader.readInt16();
    var num3;
    var num4;

    var maxItems = 40;

    if (num2 < maxItems) {
        num3 = num2;
        num4 = 0;
    } else {
        num3 = maxItems;
        num4 = num2 - maxItems;
    }

    for (var i = 0; i < num; i++) {
        var chest = {};
        chest.items = [];
        chest.x = reader.readInt32();
        chest.y = reader.readInt32();
        chest.name = readString(reader);

        var j = 0;
        var num5 = 0;

        for (j = 0; j < num3; j++) {
            num5 = reader.readInt16();

            if (num5 > 0) {
                var item = {};
                item.id = reader.readInt32();
                item.count = num5;
                item.prefixId = reader.readUint8();
                chest.items.push(item);
            }
        }

        for (j = 0; j < num4; j++) {
            num5 = reader.readInt16();
            if (num5 > 0) {
                reader.readInt32();
                reader.readUint8();
            }
        }

        chests.push(chest);
    }

    self.postMessage({
        'chests': chests,
    });
}

function readSigns(reader, world) {
    var signs = [];

    var num = reader.readInt16();

    for (var i = 0; i < num; i++) {
        var sign = {};

        sign.text = readString(reader);
        sign.x = reader.readInt32();
        sign.y = reader.readInt32();

        signs.push(sign);
    }

    self.postMessage({
        'signs': signs,
    });
}

function getNpcType(id) {
    var npc = settings.Npcs.find((element) => element.Id === id);

    if (npc) {
        return npc.Name;
    }

    return "";
}

function readNpcs(reader, world) {
    var npcs = [];

    if (world.version >= 268) {
        let num = reader.readInt32();
        while(num-- > 0) {
            reader.readInt32();
        }
    }

    var num = 0;
    var flag = reader.readUint8() > 0;

    var npc;

    while (flag) {
        npc = {};
        npc.spriteId = reader.readInt32();
        npc.type = getNpcType(npc.spriteId);
        npc.name = readString(reader);
        npc.x = reader.readFloat32() / 16;
        npc.y = reader.readFloat32() / 16;
        npc.isHomeless = reader.readUint8() > 0;
        npc.homeX = reader.readInt32();
        npc.homeY = reader.readInt32();
        if (world.version >= 213 && reader.readUint8() > 0) {
            npc.townVariation = reader.readInt32();
        }
        npcs.push(npc);

        num++;
        flag = reader.readUint8() > 0;
    }

    flag = reader.readUint8() > 0;
    while (flag) {
        npc = {};
        reader.readInt32();
        npc.type = readString(reader);
        npc.x = reader.readFloat32();
        npc.y = reader.readFloat32();
        num++;
        flag = reader.readUint8();
    }

    self.postMessage({
        'npcs': npcs,
    });
}

function readTileEntity(reader) {
    let tileType = reader.readUint8();
    if (tileType < 0 || tileType > 7) {
        return null;
    }
    let tileEntity = {};
    tileEntity.type = tileType;
    tileEntity.id = reader.readInt32();
    tileEntity.position = {x:reader.readInt16(), y:reader.readInt16()};
    switch (tileType) {
        case 0: // target dummy
            reader.readInt16();
            break;
        case 1: // item frame
        case 4: // weapon rack
        case 6: // plate
            tileEntity.item = {}
            tileEntity.item.id = reader.readInt16();
            tileEntity.item.prefixId = reader.readUint8();
            tileEntity.item.count = reader.readInt16();
            break;
        case 2: // logic sensor
            tileEntity.logicCheckType = reader.readUint8();
            tileEntity.on = reader.readUint8() > 0;
            break;
        case 3: // (wo)mannequin
            tileEntity.items = Array(8)
            tileEntity.dyes = Array(8);
            let itemBitmask = reader.readUint8();
            let dyeBitmask = reader.readUint8();
            for (let i = 0; i < 8; i++) {
                tileEntity.items[i] = {
                    id: 0
                };
                if (((itemBitmask >> i) & 1) === 1) {
                    tileEntity.items[i].id = reader.readInt16();
                    tileEntity.items[i].prefixId = reader.readUint8();
                    tileEntity.items[i].count = reader.readInt16();
                }
            }
            for (let j = 0; j < 8; j++) {
                tileEntity.dyes[j] = {
                    id: 0
                };
                if (((dyeBitmask >> j) & 1) === 1) {
                    tileEntity.dyes[j].id = reader.readInt16();
                    tileEntity.dyes[j].prefixId = reader.readUint8();
                    tileEntity.dyes[j].count = reader.readInt16();
                }
            }
            break;
        case 5: // hat rack
            tileEntity.items = Array(2)
            tileEntity.dyes = Array(2);
            let bitmask = reader.readUint8();
            for (let i = 0; i < 2; i++) {
                tileEntity.items[i] = {
                    id: 0
                };
                if (((bitmask >> i) & 1) === 1) {
                    tileEntity.items[i].id = reader.readInt16();
                    tileEntity.items[i].prefixId = reader.readUint8();
                    tileEntity.items[i].count = reader.readInt16();
                }
            }
            for (let j = 0; j < 2; j++) {
                tileEntity.dyes[j] = {
                    id: 0
                };
                if (((bitmask >> (j+2)) & 1) === 1) {
                    tileEntity.dyes[j].id = reader.readInt16();
                    tileEntity.dyes[j].prefixId = reader.readUint8();
                    tileEntity.dyes[j].count = reader.readInt16();
                }
            }
            break;
        case 7: // pylon
            break;
    }
    return tileEntity;
}

function readTileEntities(reader, world) {
    /** @type{Map<{x:int,y:int}, any>}*/
    let byPosition = new Map();
    let count = reader.readInt32();
    for (let i = 0; i < count; i++) {
        let tileEntity = readTileEntity(reader);
        byPosition.set(tileEntity.position, tileEntity);
    }
    self.postMessage({
        'tileEntities': byPosition,
    });
}

function readString(reader) {
    var stringLength = 0;
    var stringLengthParsed = false;
    var step = 0;
    while (!stringLengthParsed) {
        var part = reader.readUint8();
        stringLengthParsed = ((part >> 7) === 0);
        var partCutter = part & 127;
        part = partCutter;
        var toAdd = part << (step * 7);
        stringLength += toAdd;
        step++;
    }

    return reader.readString(stringLength);
}
