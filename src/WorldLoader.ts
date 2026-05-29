/// <reference lib="webworker" />

import { DataStream } from './DataStream';
import { npcs } from './npcs';
import type { Chest, TileEntity, WorldItem, WorldNpc, WorldTile } from './types/settings';
import { walls } from './walls';

interface WorldRecord {
  [key: string]: unknown;
  version: number;
  name: string;
  width: number;
  height: number;
  worldSurfaceY: number;
  rockLayerY: number;
  importance: boolean[];
  totalTileCount: number;
  anglerWhoFinishedTodayCount: number;
  anglersWhoFinishedToday: string[];
  savedOreTiers: { copper: number; iron: number; silver: number; gold: number };
}

self.addEventListener('message', function (e: MessageEvent) {
  start(e.data);
}, false);

const start = function (file: File): void {
  const fileReader = new FileReaderSync();

  self.postMessage({
    status: "Reading world file..."
  });

  const buffer = fileReader.readAsArrayBuffer(file);

  const ds = new DataStream(buffer);

  ds.endianness = DataStream.LITTLE_ENDIAN;

  const world = {} as WorldRecord;

  self.postMessage({
    status: "Loading world file..."
  });

  readWorldFile(ds, world);
};

function logPosition(index: number, positions: number[], reader: DataStream, name: string): void {
  const expected = positions[index];
  const actual = reader.position;
  if (expected !== actual) {
    console.error(`Position ${index} wrong after reading ${name}: Expected ${expected}, actual ${actual}, diff ${expected - actual}`);
  } else {
    console.log(`Position ${index} correct after reading ${name}: Expected ${expected}, actual ${actual}, diff ${expected - actual}`);
  }
}

function seekToPosition(index: number, positions: number[], reader: DataStream, name: string): void {
  const expected = positions[index];
  if (expected !== undefined && reader.position !== expected) {
    console.warn(`Seeking to position ${expected} after reading ${name} (was at ${reader.position}, diff ${expected - reader.position})`);
    reader.seek(expected);
  }
}

function readWorldFile(reader: DataStream, world: WorldRecord): void {
  let position = 0;

  const positions = readFileFormatHeader(reader, world);
  logPosition(position++, positions, reader, 'format');

  readHeader(reader, world);
  logPosition(position, positions, reader, 'header');
  seekToPosition(position++, positions, reader, 'header');

  readTiles(reader, world);
  logPosition(position, positions, reader, 'tiles');
  seekToPosition(position++, positions, reader, 'tiles');

  readChests(reader, world);
  logPosition(position, positions, reader, 'chests');
  seekToPosition(position++, positions, reader, 'chests');

  readSigns(reader);
  logPosition(position, positions, reader, 'signs');
  seekToPosition(position++, positions, reader, 'signs');

  readNpcs(reader, world);
  logPosition(position, positions, reader, 'NPCs');
  seekToPosition(position++, positions, reader, 'NPCs');

  readTileEntities(reader);
  logPosition(position, positions, reader, 'entities');
  seekToPosition(position++, positions, reader, 'entities');

  self.postMessage({
    done: true
  });
  console.log(world)
}

function readFileFormatHeader(reader: DataStream, world: WorldRecord): number[] {
  self.postMessage({
    status: "Reading world version..."
  });

  world.version = reader.readInt32();

  self.postMessage({
    status: "Reading world header...",
    version: world.version,
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
  let i = 0;

  const positionsLength = reader.readInt16();
  const positions = new Array(positionsLength);
  for (i = 0; i < positionsLength; i++) {
    positions[i] = reader.readInt32();
  }

  // read importance
  const importanceLength = reader.readInt16();
  world.importance = new Array(importanceLength);
  let b = 0;
  let b2 = 128;
  for (i = 0; i < importanceLength; i++) {
    if (b2 == 128) {
      b = reader.readUint8();
      b2 = 1;
    } else {
      b2 = b2 << 1;
    }

    if ((b & b2) == b2) {
      world.importance[i] = true;
    } else {
      world.importance[i] = false;
    }
  }

  return positions;
}

function readHeader(reader: DataStream, world: WorldRecord): void {
  world.name = readString(reader);

  world.seed = readString(reader);

  // world.worldGeneratorVersion
  reader.readUint32();
  reader.readUint32();

  const uuidBytes: number[] = [];
  for (let i = 0; i < 16; i++) {
    uuidBytes.push(reader.readUint8());
  }
  const hex = uuidBytes.map(b => b.toString(16).padStart(2, '0'));
  // .NET Guid stores the first three groups in little-endian byte order
  world.uniqueId = [
    hex.slice(0, 4).reverse().join(''),
    hex.slice(4, 6).reverse().join(''),
    hex.slice(6, 8).reverse().join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');

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
    if (world.version >= 302) {
      world.skyblockWorld = reader.readUint8();
    }
  }

  if (world.version >= 141) {
    // creation time (Int64)
    reader.readInt32();
    reader.readInt32();
  }

  if (world.version >= 284) {
    // last played (Int64)
    reader.readInt32();
    reader.readInt32();
  }

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
  world.numberOfClouds = reader.readInt16();
  world.windSpeed = reader.readFloat32();

  world.anglerWhoFinishedTodayCount = reader.readInt32();
  world.anglersWhoFinishedToday = [];

  for (let i2 = world.anglerWhoFinishedTodayCount; i2 > 0; i2--) {
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

  // banner system
  let killedMobs = reader.readInt16();
  for (let j = 0; j < killedMobs; j++) {
    reader.readInt32();
  }
  if (world.version >= 289) {
    killedMobs = reader.readInt16();
    for (let j = 0; j < killedMobs; j++) {
      reader.readInt16();
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

  const num3 = world.partyingNPCS = reader.readInt32();
  for (let k = 0; k < num3; k++) {
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
    reader.readUint8();
    reader.readUint8();
    reader.readUint8();
  }

  if (world.version >= 211) {
    // tree tops info
    const num = reader.readInt32();
    let num2 = 0;
    while (num2 < num && num2 < 13) {
      reader.readInt32();
      num2++;
    }
  }
  if (world.version >= 212) {
    //forceHalloweenForToday
    reader.readUint8();
    // forceXMasForToday
    reader.readUint8();
  }
  if (world.version >= 216) {
    world.savedOreTiers = {
      copper: reader.readInt32(),
      iron: reader.readInt32(),
      silver: reader.readInt32(),
      gold: reader.readInt32(),
    };
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
  if (world.version >= 261) {
    world.unlockedSlimeGreenSpawn = reader.readUint8() > 0;
    world.unlockedSlimeOldSpawn = reader.readUint8() > 0;
    world.unlockedSlimePurpleSpawn = reader.readUint8() > 0;
    world.unlockedSlimeRainbowSpawn = reader.readUint8() > 0;
    world.unlockedSlimeRedSpawn = reader.readUint8() > 0;
    world.unlockedSlimeYellowSpawn = reader.readUint8() > 0;
    world.unlockedSlimeCopperSpawn = reader.readUint8() > 0;
  }
  if (world.version >= 264) {
    reader.readUint8();
    reader.readUint8();
  }

  if (world.version >= 287) {
    world.forceHalloweenForever = reader.readUint8();
    world.forceXMasForever = reader.readUint8();
  }
  if (world.version >= 288) {
    world.vampireSeed = reader.readUint8();
  }
  else {
    world.vampireSeed = false;
  }
  if (world.version >= 296) {
    world.infectedSeed = reader.readUint8();
  }
  else {
    world.infectedSeed = false;
  }
  if (world.version >= 291) {
    world._tempMeteorShowerCount = reader.readInt32();
    world._tempCoinRain = reader.readInt32();
  }
  else {
    world._tempMeteorShowerCount = 0;
    world._tempCoinRain = 0;
  }
  if (world.version >= 297) {
    world.teamBasedSpawnsSeed = reader.readUint8();
    const b = reader.readUint8();
    for (let i = 0; i < b; i++) {
      reader.readInt16();
      reader.readInt16();
    }
  }
  world.dualDungeonsSeed = (world.version >= 304 && reader.readUint8());
  if (world.version >= 299 && world.version < 313) {
    reader.readUint32();
  }
  // manifest
  if (world.version >= 299) readString(reader);

  let hellLevel = ((world.height - 230) - world.worldSurfaceY) / 6;
  hellLevel = hellLevel * 6 + world.worldSurfaceY - 5;
  world.hellLayerY = hellLevel;
}

function readTiles(reader: DataStream, world: WorldRecord): void {
  self.postMessage({
    status: "Reading world tiles...",
    world: world,
  });

  // 	world.tiles = [world.width, world.height];
  world.totalTileCount = world.width * world.height;

  let tilesProcessed = 0;

  // world.tiles = new Array(world.width);

  let tiles: WorldTile[] = [];

  for (let x = 0; x < world.width; x++) {
    // world.tiles[x] = new Array(world.height);

    for (let y = 0; y < world.height; y++) {
      let num2 = -1;
      let b2 = 0;
      let b = 0;
      const tile: WorldTile = { x, y };
      const b4 = reader.readUint8();
      let flag = false;
      if ((b4 & 1) == 1) {
        flag = true;
        b2 = reader.readUint8();
      }
      let flag2 = false;
      if (flag && (b2 & 1) == 1) {
        flag2 = true;
        b = reader.readUint8();
      }
      let b3 = 0;
      if (flag2 && (b & 1) == 1) {
        b3 = reader.readUint8();
      }
      let b5 = 0;
      if ((b4 & 2) == 2) {
        tile.IsActive = true;
        if ((b4 & 32) == 32) {
          b5 = reader.readUint8();
          num2 = reader.readUint8();
          num2 = (num2 << 8 | b5);
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
          tile.tileColor = reader.readUint8();
        }
      }
      if ((b4 & 4) == 4) {
        tile.WallType = reader.readUint8();
        if (tile.WallType >= walls.length) {
          tile.WallType = 0;
        }
        tile.IsWallPresent = true;
        if ((b & 16) == 16) {
          tile.WallColor = reader.readUint8();
          tile.IsWallColorPresent = true;
        }
      }
      b5 = (b4 & 24) >> 3;
      if (b5 !== 0) {
        tile.IsLiquidPresent = true;
        tile.LiquidAmount = reader.readUint8();
        if ((b & 128) == 128) {
          tile.Shimmer = true;
        }
        if (b5 > 1) {
          if (b5 == 2) {
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
          tile.IsBlueWirePresent = true;
        }
        if ((b2 & 8) == 8) {
          tile.IsGreenWirePresent = true;
        }
        b5 = (b2 & 112) >> 4;
        if (b5 !== 0) {
          tile.slope = b5;
        }
      }
      if (b > 1) {
        if ((b & 2) == 2) {
          tile.IsActuatorPresent = true;
        }
        if ((b & 4) == 4) {
          tile.IsActive = false;
        }
        if ((b & 32) == 32) {
          tile.IsYellowWirePresent = true;
        }
        if ((b & 64) == 64) {
          b5 = reader.readUint8();
          tile.WallType = (b5 << 8 | (tile.WallType ?? 0));
          if (tile.WallType >= walls.length) {
            tile.WallType = 0;
          }
        }
      }
      if (b3 > 0) {
        if ((b3 & 2) == 2) {
          tile.echoBlock = true;
        }
        if ((b3 & 4) == 4) {
          tile.echoWall = true;
        }
        if ((b3 & 8) == 8) {
          tile.illuminantBlock = true;
        }
        if ((b3 & 16) == 16) {
          tile.illuminantWall = true;
        }
      }
      b5 = (b4 & 192) >> 6;
      let k = 0;
      if (b5 == 0) {
        k = 0;
      }
      else if (b5 == 1) {
        k = reader.readUint8();
      }
      else {
        k = reader.readInt16();
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
        status: `Reading tile ${tilesProcessed.toLocaleString()} of ${world.totalTileCount.toLocaleString()}`,
        // 'tilesProcessed': tilesProcessed,
        // 'totalTileCount': world.totalTileCount,
        x: x - 1,
        tiles: tiles,
      });
      tiles = [];
    }
  }
}

function readChests(reader: DataStream, world: WorldRecord): void {
  const chests: Chest[] = [];

  const num = reader.readInt16();
  let num2 = 0;

  if (world.version < 294) {
    num2 = reader.readInt16();
  }

  for (let i = 0; i < num; i++) {
    const chest: Chest = { maxItems: 40, items: [], x: reader.readInt32(), y: reader.readInt32(), name: readString(reader) };

    if (world.version >= 294) {
      const num3 = reader.readInt32();
      chest.maxItems = num3;
      num2 = num3;
    }

    let num4: number;
    let num5: number;
    if (num2 < chest.maxItems) {
      num4 = num2;
      num5 = 0;
    }
    else {
      num4 = chest.maxItems;
      num5 = num2 - chest.maxItems;
    }
    for (let j = 0; j < num4; j++) {
      const num6 = reader.readInt16();
      const item: WorldItem = { id: 0, count: 0, prefixId: 0 };
      if (num6 > 0) {
        item.id = reader.readInt32();
        item.count = num6;
        item.prefixId = reader.readUint8();
      }
      else if (num6 < 0) {
        item.id = reader.readInt32();
        item.prefixId = reader.readUint8();
        item.count = 1;
      }
      if (item.count > 0) {
        chest.items.push(item);
      }
    }
    for (let k = 0; k < num5; k++) {
      const num6 = reader.readInt16();
      if (num6 > 0) {
        reader.readInt32();
        reader.readUint8();
      }
    }

    chests.push(chest);
  }

  self.postMessage({
    chests: chests,
  });
}

function readSigns(reader: DataStream): void {
  interface Sign { text: string, x: number, y: number };

  const signs: Sign[] = [];

  const num = reader.readInt16();

  for (let i = 0; i < num; i++) {
    const sign: Sign = {
      text: readString(reader),
      x: reader.readInt32(),
      y: reader.readInt32(),
    };

    signs.push(sign);
  }

  self.postMessage({
    signs: signs,
  });
}

function getNpcType(id: number): string {
  const npc = npcs.find((element) => element.Id === id);

  if (npc) {
    return npc.Name;
  }

  if ([670, 678, 679, 680, 681, 682, 683, 684].includes(id)) return 'Slime';

  return `Unknown NPC (ID ${id})`;
}

function readNpcs(reader: DataStream, world: WorldRecord): void {
  const npcs: WorldNpc[] = [];

  if (world.version >= 268) {
    let num = reader.readInt32();
    while (num-- > 0) {
      reader.readInt32();
    }
  }

  let flag = reader.readUint8() > 0;

  while (flag) {
    const spriteId = reader.readInt32();
    const npc: WorldNpc = {
      spriteId,
      type: getNpcType(spriteId),
      name: readString(reader),
      x: reader.readFloat32() / 16,
      y: reader.readFloat32() / 16,
      isHomeless: reader.readUint8() > 0,
      homeX: reader.readInt32(),
      homeY: reader.readInt32(),
    };
    if (world.version >= 213 && reader.readUint8() > 0) {
      npc.townVariation = reader.readInt32();
    }
    if (world.version >= 315) {
      npc.homelessDespawn = reader.readUint8() > 0;
    }
    npcs.push(npc);

    flag = reader.readUint8() > 0;
  }

  flag = reader.readUint8() > 0;
  while (flag) {
    reader.readInt32();
    reader.readFloat32();
    reader.readFloat32();
    flag = reader.readUint8() > 0;
  }

  self.postMessage({
    npcs: npcs,
  });
}

function readTileEntity(reader: DataStream): TileEntity | null {
  const tileType = reader.readUint8();
  if (tileType < 0 || tileType > 10) {
    console.error({ tileType });
    return null;
  }
  const tileEntity: TileEntity = {
    type: tileType,
    id: reader.readInt32(),
    position: { x: reader.readInt16(), y: reader.readInt16() },
  };
  switch (tileType) {
    case 0: // target dummy
      reader.readInt16();
      break;
    case 1: // item frame
    case 4: // weapon rack
    case 6: // plate
    case 8: // dead cells display jar
      tileEntity.item = {
        id: reader.readInt16(),
        prefixId: reader.readUint8(),
        count: reader.readInt16(),
      };
      break;
    case 2: // logic sensor
      tileEntity.logicCheckType = reader.readUint8();
      tileEntity.on = reader.readUint8() > 0;
      break;
    case 3: { // display doll / (wo)mannequin
      tileEntity.items = Array(9)
      tileEntity.dyes = Array(9);
      tileEntity.misc = Array(1);
      const arg_62_0 = reader.readUint8();
      const bb = reader.readUint8();
      const pose = reader.readUint8();
      const bitsByte = reader.readUint8();

      tileEntity.arg_62_0 = arg_62_0;
      tileEntity.bb = bb;
      tileEntity.pose = pose;
      tileEntity.bitsByte = bitsByte;

      const num = arg_62_0 | (((bitsByte >> 1) & 1) ? 256 : 0);
      for (let i = 0; i < tileEntity.items.length; i++) {
        if ((num & 1 << i) != 0) {
          tileEntity.items[i] = { id: reader.readInt16(), prefixId: reader.readUint8(), count: reader.readInt16() };
        } else {
          tileEntity.items[i] = { id: 0, prefixId: 0, count: 0 };
        }
      }
      const num2 = (bb | (((bitsByte >> 2) & 1) ? 256 : 0));
      for (let j = 0; j < tileEntity.dyes.length; j++) {
        if ((num2 & 1 << (j & 31)) != 0) {
          tileEntity.dyes[j] = { id: reader.readInt16(), prefixId: reader.readUint8(), count: reader.readInt16() };
        } else {
          tileEntity.dyes[j] = { id: 0, prefixId: 0, count: 0 };
        }
      }
      for (let k = 0; k < tileEntity.misc.length; k++) {
        if (((bitsByte >> k) & 1)) {
          tileEntity.misc[k] = { id: reader.readInt16(), prefixId: reader.readUint8(), count: reader.readInt16() };
        } else {
          tileEntity.misc[k] = { id: 0, prefixId: 0, count: 0 };
        }
      }
      break;
    }
    case 5: // hat rack
      {
        tileEntity.items = Array(2)
        tileEntity.dyes = Array(2);
        const bitmask = reader.readUint8();
        for (let i = 0; i < 2; i++) {
          if (((bitmask >> i) & 1) === 1) {
            tileEntity.items[i] = { id: reader.readInt16(), prefixId: reader.readUint8(), count: reader.readInt16() };
          } else {
            tileEntity.items[i] = { id: 0, prefixId: 0, count: 0 };
          }
        }
        for (let j = 0; j < 2; j++) {
          if (((bitmask >> (j + 2)) & 1) === 1) {
            tileEntity.dyes[j] = { id: reader.readInt16(), prefixId: reader.readUint8(), count: reader.readInt16() };
          } else {
            tileEntity.dyes[j] = { id: 0, prefixId: 0, count: 0 };
          }
        }
        break;
      }
    case 7: // pylon
      break;
    case 9: // kite anchor
    case 10: // critter anchor
      tileEntity.item = { id: reader.readInt16(), prefixId: 0, count: 0 };
  }
  return tileEntity;
}

function readTileEntities(reader: DataStream): void {
  const byPosition = new Map<{ x: number; y: number }, TileEntity>();
  const count = reader.readInt32();
  let lastPosition: { x: number; y: number } | undefined;
  for (let i = 0; i < count; i++) {
    const tileEntity = readTileEntity(reader);
    if (!tileEntity) {
      console.error({ tileEntity, lastPosition });
      continue;
    }
    lastPosition = tileEntity.position;
    byPosition.set(tileEntity.position, tileEntity);
  }
  self.postMessage({
    tileEntities: byPosition,
  });
}

function readString(reader: DataStream): string {
  let stringLength = 0;
  let stringLengthParsed = false;
  let step = 0;
  while (!stringLengthParsed) {
    let part = reader.readUint8();
    stringLengthParsed = ((part >> 7) === 0);
    const partCutter = part & 127;
    part = partCutter;
    const toAdd = part << (step * 7);
    stringLength += toAdd;
    step++;
  }

  return reader.readString(stringLength);
}

export { readChests, readFileFormatHeader, readHeader, readNpcs, readSigns, readString, readTileEntities, readTiles, readWorldFile };
export type { WorldRecord };

