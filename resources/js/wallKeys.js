// from Terraria.Tile.WallId, flipped from wallIds.js
const wallKeys = {
  1: "Stone",
  2: "DirtUnsafe",
  3: "EbonstoneUnsafe",
  4: "Wood",
  5: "GrayBrick",
  6: "RedBrick",
  7: "BlueDungeonUnsafe",
  8: "GreenDungeonUnsafe",
  9: "PinkDungeonUnsafe",
  10: "GoldBrick",
  11: "SilverBrick",
  12: "CopperBrick",
  13: "HellstoneBrickUnsafe",
  14: "ObsidianBrickUnsafe",
  15: "MudUnsafe",
  16: "Dirt",
  17: "BlueDungeon",
  18: "GreenDungeon",
  19: "PinkDungeon",
  20: "ObsidianBrick",
  21: "Glass",
  22: "PearlstoneBrick",
  23: "IridescentBrick",
  24: "MudstoneBrick",
  25: "CobaltBrick",
  26: "MythrilBrick",
  27: "Planked",
  28: "PearlstoneBrickUnsafe",
  29: "CandyCane",
  30: "GreenCandyCane",
  31: "SnowBrick",
  32: "AdamantiteBeam",
  33: "DemoniteBrick",
  34: "SandstoneBrick",
  35: "EbonstoneBrick",
  36: "RedStucco",
  37: "YellowStucco",
  38: "GreenStucco",
  39: "Gray",
  40: "SnowWallUnsafe",
  41: "Ebonwood",
  42: "RichMaogany",
  43: "Pearlwood",
  44: "RainbowBrick",
  45: "TinBrick",
  46: "TungstenBrick",
  47: "PlatinumBrick",
  48: "AmethystUnsafe",
  49: "TopazUnsafe",
  50: "SapphireUnsafe",
  51: "EmeraldUnsafe",
  52: "RubyUnsafe",
  53: "DiamondUnsafe",
  54: "CaveUnsafe",
  55: "Cave2Unsafe",
  56: "Cave3Unsafe",
  57: "Cave4Unsafe",
  58: "Cave5Unsafe",
  59: "Cave6Unsafe",
  60: "LivingLeaf",
  61: "Cave7Unsafe",
  62: "SpiderUnsafe",
  63: "GrassUnsafe",
  64: "JungleUnsafe",
  65: "FlowerUnsafe",
  66: "Grass",
  67: "Jungle",
  68: "Flower",
  69: "CorruptGrassUnsafe",
  70: "HallowedGrassUnsafe",
  71: "IceUnsafe",
  72: "Cactus",
  73: "Cloud",
  74: "Mushroom",
  75: "Bone",
  76: "Slime",
  77: "Flesh",
  78: "LivingWood",
  79: "ObsidianBackUnsafe",
  80: "MushroomUnsafe",
  81: "CrimsonGrassUnsafe",
  82: "DiscWall",
  83: "CrimstoneUnsafe",
  84: "IceBrick",
  85: "Shadewood",
  86: "HiveUnsafe",
  87: "LihzahrdBrickUnsafe",
  88: "PurpleStainedGlass",
  89: "YellowStainedGlass",
  90: "BlueStainedGlass",
  91: "GreenStainedGlass",
  92: "RedStainedGlass",
  93: "RainbowStainedGlass",
  94: "BlueDungeonSlabUnsafe",
  95: "BlueDungeonTileUnsafe",
  96: "PinkDungeonSlabUnsafe",
  97: "PinkDungeonTileUnsafe",
  98: "GreenDungeonSlabUnsafe",
  99: "GreenDungeonTileUnsafe",
  100: "BlueDungeonSlab",
  101: "BlueDungeonTile",
  102: "PinkDungeonSlab",
  103: "PinkDungeonTile",
  104: "GreenDungeonSlab",
  105: "GreenDungeonTile",
  106: "WoodenFence",
  107: "MetalFence",
  108: "Hive",
  109: "PalladiumColumn",
  110: "BubblegumBlock",
  111: "TitanstoneBlock",
  112: "LihzahrdBrick",
  113: "Pumpkin",
  114: "Hay",
  115: "SpookyWood",
  116: "ChristmasTreeWallpaper",
  117: "OrnamentWallpaper",
  118: "CandyCaneWallpaper",
  119: "FestiveWallpaper",
  120: "StarsWallpaper",
  121: "SquigglesWallpaper",
  122: "SnowflakeWallpaper",
  123: "KrampusHornWallpaper",
  124: "BluegreenWallpaper",
  125: "GrinchFingerWallpaper",
  126: "FancyGrayWallpaper",
  127: "IceFloeWallpaper",
  128: "MusicWallpaper",
  129: "PurpleRainWallpaper",
  130: "RainbowWallpaper",
  131: "SparkleStoneWallpaper",
  132: "StarlitHeavenWallpaper",
  133: "BubbleWallpaper",
  134: "CopperPipeWallpaper",
  135: "DuckyWallpaper",
  136: "Waterfall",
  137: "Lavafall",
  138: "EbonwoodFence",
  139: "RichMahoganyFence",
  140: "PearlwoodFence",
  141: "ShadewoodFence",
  142: "WhiteDynasty",
  143: "BlueDynasty",
  144: "ArcaneRunes",
  145: "IronFence",
  146: "CopperPlating",
  147: "StoneSlab",
  148: "Sail",
  149: "BorealWood",
  150: "BorealWoodFence",
  151: "PalmWood",
  152: "PalmWoodFence",
  153: "AmberGemspark",
  154: "AmethystGemspark",
  155: "DiamondGemspark",
  156: "EmeraldGemspark",
  157: "AmberGemsparkOff",
  158: "AmethystGemsparkOff",
  159: "DiamondGemsparkOff",
  160: "EmeraldGemsparkOff",
  161: "RubyGemsparkOff",
  162: "SapphireGemsparkOff",
  163: "TopazGemsparkOff",
  164: "RubyGemspark",
  165: "SapphireGemspark",
  166: "TopazGemspark",
  167: "TinPlating",
  168: "Confetti",
  169: "ConfettiBlack",
  170: "CaveWall",
  171: "CaveWall2",
  172: "Honeyfall",
  173: "ChlorophyteBrick",
  174: "CrimtaneBrick",
  175: "ShroomitePlating",
  176: "MartianConduit",
  177: "HellstoneBrick",
  178: "MarbleUnsafe",
  179: "MarbleBlock",
  180: "GraniteUnsafe",
  181: "GraniteBlock",
  182: "MeteoriteBrick",
  183: "Marble",
  184: "Granite",
  185: "Cave8Unsafe",
  186: "Crystal",
  187: "Sandstone",
  188: "CorruptionUnsafe1",
  189: "CorruptionUnsafe2",
  190: "CorruptionUnsafe3",
  191: "CorruptionUnsafe4",
  192: "CrimsonUnsafe1",
  193: "CrimsonUnsafe2",
  194: "CrimsonUnsafe3",
  195: "CrimsonUnsafe4",
  196: "DirtUnsafe1",
  197: "DirtUnsafe2",
  198: "DirtUnsafe3",
  199: "DirtUnsafe4",
  200: "HallowUnsafe1",
  201: "HallowUnsafe2",
  202: "HallowUnsafe3",
  203: "HallowUnsafe4",
  204: "JungleUnsafe1",
  205: "JungleUnsafe2",
  206: "JungleUnsafe3",
  207: "JungleUnsafe4",
  208: "LavaUnsafe1",
  209: "LavaUnsafe2",
  210: "LavaUnsafe3",
  211: "LavaUnsafe4",
  212: "RocksUnsafe1",
  213: "RocksUnsafe2",
  214: "RocksUnsafe3",
  215: "RocksUnsafe4",
  216: "HardenedSand",
  217: "CorruptHardenedSand",
  218: "CrimsonHardenedSand",
  219: "HallowHardenedSand",
  220: "CorruptSandstone",
  221: "CrimsonSandstone",
  222: "HallowSandstone",
  223: "DesertFossil",
  224: "LunarBrickWall",
  225: "CogWall",
  226: "SandFall",
  227: "SnowFall",
  228: "SillyBalloonPinkWall",
  229: "SillyBalloonPurpleWall",
  230: "SillyBalloonGreenWall",
  231: "IronBrick",
  232: "LeadBrick",
  233: "LesionBlock",
  234: "CrimstoneBrick",
  235: "SmoothSandstone",
  236: "Spider",
  237: "SolarBrick",
  238: "VortexBrick",
  239: "NebulaBrick",
  240: "StardustBrick",
  241: "OrangeStainedGlass",
  242: "GoldStarryGlassWall",
  243: "BlueStarryGlassWall",
  244: "LivingWoodUnsafe",
  245: "WroughtIronFence",
  246: "EbonstoneEcho",
  247: "MudWallEcho",
  248: "PearlstoneEcho",
  249: "SnowWallEcho",
  250: "AmethystEcho",
  251: "TopazEcho",
  252: "SapphireEcho",
  253: "EmeraldEcho",
  254: "RubyEcho",
  255: "DiamondEcho",
  256: "Cave1Echo",
  257: "Cave2Echo",
  258: "Cave3Echo",
  259: "Cave4Echo",
  260: "Cave5Echo",
  261: "Cave6Echo",
  262: "Cave7Echo",
  263: "SpiderEcho",
  264: "CorruptGrassEcho",
  265: "HallowedGrassEcho",
  266: "IceEcho",
  267: "ObsidianBackEcho",
  268: "CrimsonGrassEcho",
  269: "CrimstoneEcho",
  270: "CaveWall1Echo",
  271: "CaveWall2Echo",
  272: "MarbleEchoUnused",
  273: "GraniteEchoUnused",
  274: "Cave8Echo",
  275: "SandstoneEcho",
  276: "Corruption1Echo",
  277: "Corruption2Echo",
  278: "Corruption3Echo",
  279: "Corruption4Echo",
  280: "Crimson1Echo",
  281: "Crimson2Echo",
  282: "Crimson3Echo",
  283: "Crimson4Echo",
  284: "Dirt1Echo",
  285: "Dirt2Echo",
  286: "Dirt3Echo",
  287: "Dirt4Echo",
  288: "Hallow1Echo",
  289: "Hallow2Echo",
  290: "Hallow3Echo",
  291: "Hallow4Echo",
  292: "Jungle1Echo",
  293: "Jungle2Echo",
  294: "Jungle3Echo",
  295: "Jungle4Echo",
  296: "Lava1Echo",
  297: "Lava2Echo",
  298: "Lava3Echo",
  299: "Lava4Echo",
  300: "Rocks1Echo",
  301: "Rocks2Echo",
  302: "Rocks3Echo",
  303: "Rocks4Echo",
  304: "HardenedSandEcho",
  305: "CorruptHardenedSandEcho",
  306: "CrimsonHardenedSandEcho",
  307: "HallowHardenedSandEcho",
  308: "CorruptSandstoneEcho",
  309: "CrimsonSandstoneEcho",
  310: "HallowSandstoneEcho",
  311: "DesertFossilEcho",
  312: "BambooBlockWall",
  313: "LargeBambooBlockWall",
  314: "AmberStoneWallEcho",
  315: "BambooFence",
  316: "AshWood",
  317: "AshWoodFence",
  318: "EchoWall",
  319: "ReefWall",
  320: "PoopWall",
  321: "ShimmerBlockWall",
  322: "ShimmerBrickWall",
  323: "LunarRustBrickWall",
  324: "DarkCelestialBrickWall",
  325: "AstraBrickWall",
  326: "CosmicEmberBrickWall",
  327: "CryocoreBrickWall",
  328: "MercuryBrickWall",
  329: "StarRoyaleBrickWall",
  330: "HeavenforgeBrickWall",
  331: "AncientBlueBrickWall",
  332: "AncientGreenBrickWall",
  333: "AncientPinkBrickWall",
  334: "AncientGoldBrickWall",
  335: "AncientSilverBrickWall",
  336: "AncientCopperBrickWall",
  337: "AncientObsidianBrickWall",
  338: "AncientHellstoneBrickWall",
  339: "AncientCobaltBrickWall",
  340: "AncientMythrilBrickWall",
  341: "LavaMossBlockWall",
  342: "ArgonMossBlockWall",
  343: "KryptonMossBlockWall",
  344: "XenonMossBlockWall",
  345: "VioletMossBlockWall",
  346: "RainbowMossBlockWall",
};

settings.Walls.forEach((wall) => {
  const wallKey = wallKeys[wall.Id];
  if (!wallKey) return;
  const wallName = names[wallKey];
  if (!wallName) return;
  wall.Name = wallName;
});
