// from Terraria.Tile.TileId, flipped from tileIds.js
const tileKeys = {
  "0": "Dirt",
  "1": "Stone",
  "2": "Grass",
  "3": "Plants",
  "4": "Torches",
  "5": "Trees",
  "6": "Iron",
  "7": "Copper",
  "8": "Gold",
  "9": "Silver",
  "10": "ClosedDoor",
  "11": "OpenDoor",
  "12": "Heart",
  "13": "Bottles",
  "14": "Tables",
  "15": "Chairs",
  "16": "Anvils",
  "17": "Furnaces",
  "18": "WorkBenches",
  "19": "Platforms",
  "20": "Saplings",
  "21": "Containers",
  "22": "Demonite",
  "23": "CorruptGrass",
  "24": "CorruptPlants",
  "25": "Ebonstone",
  "26": "DemonAltar",
  "27": "Sunflower",
  "28": "Pots",
  "29": "PiggyBank",
  "30": "WoodBlock",
  "31": "ShadowOrbs",
  "32": "CorruptThorns",
  "33": "Candles",
  "34": "Chandeliers",
  "35": "Jackolanterns",
  "36": "Presents",
  "37": "Meteorite",
  "38": "GrayBrick",
  "39": "RedBrick",
  "40": "ClayBlock",
  "41": "BlueDungeonBrick",
  "42": "HangingLanterns",
  "43": "GreenDungeonBrick",
  "44": "PinkDungeonBrick",
  "45": "GoldBrick",
  "46": "SilverBrick",
  "47": "CopperBrick",
  "48": "Spikes",
  "49": "WaterCandle",
  "50": "Books",
  "51": "Cobweb",
  "52": "Vines",
  "53": "Sand",
  "54": "Glass",
  "55": "Signs",
  "56": "Obsidian",
  "57": "Ash",
  "58": "Hellstone",
  "59": "Mud",
  "60": "JungleGrass",
  "61": "JunglePlants",
  "62": "JungleVines",
  "63": "Sapphire",
  "64": "Ruby",
  "65": "Emerald",
  "66": "Topaz",
  "67": "Amethyst",
  "68": "Diamond",
  "69": "JungleThorns",
  "70": "MushroomGrass",
  "71": "MushroomPlants",
  "72": "MushroomTrees",
  "73": "Plants2",
  "74": "JunglePlants2",
  "75": "ObsidianBrick",
  "76": "HellstoneBrick",
  "77": "Hellforge",
  "78": "ClayPot",
  "79": "Beds",
  "80": "Cactus",
  "81": "Coral",
  "82": "ImmatureHerbs",
  "83": "MatureHerbs",
  "84": "BloomingHerbs",
  "85": "Tombstones",
  "86": "Loom",
  "87": "Pianos",
  "88": "Dressers",
  "89": "Benches",
  "90": "Bathtubs",
  "91": "Banners",
  "92": "Lampposts",
  "93": "Lamps",
  "94": "Kegs",
  "95": "ChineseLanterns",
  "96": "CookingPots",
  "97": "Safes",
  "98": "SkullLanterns",
  "99": "TrashCan",
  "100": "Candelabras",
  "101": "Bookcases",
  "102": "Thrones",
  "103": "Bowls",
  "104": "GrandfatherClocks",
  "105": "Statues",
  "106": "Sawmill",
  "107": "Cobalt",
  "108": "Mythril",
  "109": "HallowedGrass",
  "110": "HallowedPlants",
  "111": "Adamantite",
  "112": "Ebonsand",
  "113": "HallowedPlants2",
  "114": "TinkerersWorkbench",
  "115": "HallowedVines",
  "116": "Pearlsand",
  "117": "Pearlstone",
  "118": "PearlstoneBrick",
  "119": "IridescentBrick",
  "120": "Mudstone",
  "121": "CobaltBrick",
  "122": "MythrilBrick",
  "123": "Silt",
  "124": "WoodenBeam",
  "125": "CrystalBall",
  "126": "DiscoBall",
  "127": "MagicalIceBlock",
  "128": "Mannequin",
  "129": "Crystals",
  "130": "ActiveStoneBlock",
  "131": "InactiveStoneBlock",
  "132": "Lever",
  "133": "AdamantiteForge",
  "134": "MythrilAnvil",
  "135": "PressurePlates",
  "136": "Switches",
  "137": "Traps",
  "138": "Boulder",
  "139": "MusicBoxes",
  "140": "DemoniteBrick",
  "141": "Explosives",
  "142": "InletPump",
  "143": "OutletPump",
  "144": "Timers",
  "145": "CandyCaneBlock",
  "146": "GreenCandyCaneBlock",
  "147": "SnowBlock",
  "148": "SnowBrick",
  "149": "HolidayLights",
  "150": "AdamantiteBeam",
  "151": "SandstoneBrick",
  "152": "EbonstoneBrick",
  "153": "RedStucco",
  "154": "YellowStucco",
  "155": "GreenStucco",
  "156": "GrayStucco",
  "157": "Ebonwood",
  "158": "RichMahogany",
  "159": "Pearlwood",
  "160": "RainbowBrick",
  "161": "IceBlock",
  "162": "BreakableIce",
  "163": "CorruptIce",
  "164": "HallowedIce",
  "165": "Stalactite",
  "166": "Tin",
  "167": "Lead",
  "168": "Tungsten",
  "169": "Platinum",
  "170": "PineTree",
  "171": "ChristmasTree",
  "172": "Sinks",
  "173": "PlatinumCandelabra",
  "174": "PlatinumCandle",
  "175": "TinBrick",
  "176": "TungstenBrick",
  "177": "PlatinumBrick",
  "178": "ExposedGems",
  "179": "GreenMoss",
  "180": "BrownMoss",
  "181": "RedMoss",
  "182": "BlueMoss",
  "183": "PurpleMoss",
  "184": "LongMoss",
  "185": "SmallPiles",
  "186": "LargePiles",
  "187": "LargePiles2",
  "188": "CactusBlock",
  "189": "Cloud",
  "190": "MushroomBlock",
  "191": "LivingWood",
  "192": "LeafBlock",
  "193": "SlimeBlock",
  "194": "BoneBlock",
  "195": "FleshBlock",
  "196": "RainCloud",
  "197": "FrozenSlimeBlock",
  "198": "Asphalt",
  "199": "CrimsonGrass",
  "200": "FleshIce",
  "201": "CrimsonPlants",
  "202": "Sunplate",
  "203": "Crimstone",
  "204": "Crimtane",
  "205": "CrimsonVines",
  "206": "IceBrick",
  "207": "WaterFountain",
  "208": "Shadewood",
  "209": "Cannon",
  "210": "LandMine",
  "211": "Chlorophyte",
  "212": "SnowballLauncher",
  "213": "Rope",
  "214": "Chain",
  "215": "Campfire",
  "216": "Firework",
  "217": "Blendomatic",
  "218": "MeatGrinder",
  "219": "Extractinator",
  "220": "Solidifier",
  "221": "Palladium",
  "222": "Orichalcum",
  "223": "Titanium",
  "224": "Slush",
  "225": "Hive",
  "226": "LihzahrdBrick",
  "227": "DyePlants",
  "228": "DyeVat",
  "229": "HoneyBlock",
  "230": "CrispyHoneyBlock",
  "231": "Larva",
  "232": "WoodenSpikes",
  "233": "PlantDetritus",
  "234": "Crimsand",
  "235": "Teleporter",
  "236": "LifeFruit",
  "237": "LihzahrdAltar",
  "238": "PlanteraBulb",
  "239": "MetalBars",
  "240": "Painting3X3",
  "241": "Painting4X3",
  "242": "Painting6X4",
  "243": "ImbuingStation",
  "244": "BubbleMachine",
  "245": "Painting2X3",
  "246": "Painting3X2",
  "247": "Autohammer",
  "248": "PalladiumColumn",
  "249": "BubblegumBlock",
  "250": "Titanstone",
  "251": "PumpkinBlock",
  "252": "HayBlock",
  "253": "SpookyWood",
  "254": "Pumpkins",
  "255": "AmethystGemsparkOff",
  "256": "TopazGemsparkOff",
  "257": "SapphireGemsparkOff",
  "258": "EmeraldGemsparkOff",
  "259": "RubyGemsparkOff",
  "260": "DiamondGemsparkOff",
  "261": "AmberGemsparkOff",
  "262": "AmethystGemspark",
  "263": "TopazGemspark",
  "264": "SapphireGemspark",
  "265": "EmeraldGemspark",
  "266": "RubyGemspark",
  "267": "DiamondGemspark",
  "268": "AmberGemspark",
  "269": "Womannequin",
  "270": "FireflyinaBottle",
  "271": "LightningBuginaBottle",
  "272": "Cog",
  "273": "StoneSlab",
  "274": "SandStoneSlab",
  "275": "BunnyCage",
  "276": "SquirrelCage",
  "277": "MallardDuckCage",
  "278": "DuckCage",
  "279": "BirdCage",
  "280": "BlueJay",
  "281": "CardinalCage",
  "282": "FishBowl",
  "283": "HeavyWorkBench",
  "284": "CopperPlating",
  "285": "SnailCage",
  "286": "GlowingSnailCage",
  "287": "AmmoBox",
  "288": "MonarchButterflyJar",
  "289": "PurpleEmperorButterflyJar",
  "290": "RedAdmiralButterflyJar",
  "291": "UlyssesButterflyJar",
  "292": "SulphurButterflyJar",
  "293": "TreeNymphButterflyJar",
  "294": "ZebraSwallowtailButterflyJar",
  "295": "JuliaButterflyJar",
  "296": "ScorpionCage",
  "297": "BlackScorpionCage",
  "298": "FrogCage",
  "299": "MouseCage",
  "300": "BoneWelder",
  "301": "FleshCloningVat",
  "302": "GlassKiln",
  "303": "LihzahrdFurnace",
  "304": "LivingLoom",
  "305": "SkyMill",
  "306": "IceMachine",
  "307": "SteampunkBoiler",
  "308": "HoneyDispenser",
  "309": "PenguinCage",
  "310": "WormCage",
  "311": "DynastyWood",
  "312": "RedDynastyShingles",
  "313": "BlueDynastyShingles",
  "314": "MinecartTrack",
  "315": "Coralstone",
  "316": "BlueJellyfishBowl",
  "317": "GreenJellyfishBowl",
  "318": "PinkJellyfishBowl",
  "319": "ShipInABottle",
  "320": "SeaweedPlanter",
  "321": "BorealWood",
  "322": "PalmWood",
  "323": "PalmTree",
  "324": "BeachPiles",
  "325": "TinPlating",
  "326": "Waterfall",
  "327": "Lavafall",
  "328": "Confetti",
  "329": "ConfettiBlack",
  "330": "CopperCoinPile",
  "331": "SilverCoinPile",
  "332": "GoldCoinPile",
  "333": "PlatinumCoinPile",
  "334": "WeaponsRack",
  "335": "FireworksBox",
  "336": "LivingFire",
  "337": "AlphabetStatues",
  "338": "FireworkFountain",
  "339": "GrasshopperCage",
  "340": "LivingCursedFire",
  "341": "LivingDemonFire",
  "342": "LivingFrostFire",
  "343": "LivingIchor",
  "344": "LivingUltrabrightFire",
  "345": "Honeyfall",
  "346": "ChlorophyteBrick",
  "347": "CrimtaneBrick",
  "348": "ShroomitePlating",
  "349": "MushroomStatue",
  "350": "MartianConduitPlating",
  "351": "ChimneySmoke",
  "352": "CrimsonThorns",
  "353": "VineRope",
  "354": "BewitchingTable",
  "355": "AlchemyTable",
  "356": "Sundial",
  "357": "MarbleBlock",
  "358": "GoldBirdCage",
  "359": "GoldBunnyCage",
  "360": "GoldButterflyCage",
  "361": "GoldFrogCage",
  "362": "GoldGrasshopperCage",
  "363": "GoldMouseCage",
  "364": "GoldWormCage",
  "365": "SilkRope",
  "366": "WebRope",
  "367": "Marble",
  "368": "Granite",
  "369": "GraniteBlock",
  "370": "MeteoriteBrick",
  "371": "PinkSlimeBlock",
  "372": "PeaceCandle",
  "373": "WaterDrip",
  "374": "LavaDrip",
  "375": "HoneyDrip",
  "376": "FishingCrate",
  "377": "SharpeningStation",
  "378": "TargetDummy",
  "379": "Bubble",
  "380": "PlanterBox",
  "381": "LavaMoss",
  "382": "VineFlowers",
  "383": "LivingMahogany",
  "384": "LivingMahoganyLeaves",
  "385": "CrystalBlock",
  "386": "TrapdoorOpen",
  "387": "TrapdoorClosed",
  "388": "TallGateClosed",
  "389": "TallGateOpen",
  "390": "LavaLamp",
  "391": "CageEnchantedNightcrawler",
  "392": "CageBuggy",
  "393": "CageGrubby",
  "394": "CageSluggy",
  "395": "ItemFrame",
  "396": "Sandstone",
  "397": "HardenedSand",
  "398": "CorruptHardenedSand",
  "399": "CrimsonHardenedSand",
  "400": "CorruptSandstone",
  "401": "CrimsonSandstone",
  "402": "HallowHardenedSand",
  "403": "HallowSandstone",
  "404": "DesertFossil",
  "405": "Fireplace",
  "406": "Chimney",
  "407": "FossilOre",
  "408": "LunarOre",
  "409": "LunarBrick",
  "410": "LunarMonolith",
  "411": "Detonator",
  "412": "LunarCraftingStation",
  "413": "SquirrelOrangeCage",
  "414": "SquirrelGoldCage",
  "415": "LunarBlockSolar",
  "416": "LunarBlockVortex",
  "417": "LunarBlockNebula",
  "418": "LunarBlockStardust",
  "419": "LogicGateLamp",
  "420": "LogicGate",
  "421": "ConveyorBeltLeft",
  "422": "ConveyorBeltRight",
  "423": "LogicSensor",
  "424": "WirePipe",
  "425": "AnnouncementBox",
  "426": "TeamBlockRed",
  "427": "TeamBlockRedPlatform",
  "428": "WeightedPressurePlate",
  "429": "WireBulb",
  "430": "TeamBlockGreen",
  "431": "TeamBlockBlue",
  "432": "TeamBlockYellow",
  "433": "TeamBlockPink",
  "434": "TeamBlockWhite",
  "435": "TeamBlockGreenPlatform",
  "436": "TeamBlockBluePlatform",
  "437": "TeamBlockYellowPlatform",
  "438": "TeamBlockPinkPlatform",
  "439": "TeamBlockWhitePlatform",
  "440": "GemLocks",
  "441": "FakeContainers",
  "442": "ProjectilePressurePad",
  "443": "GeyserTrap",
  "444": "BeeHive",
  "445": "PixelBox",
  "446": "SillyBalloonPink",
  "447": "SillyBalloonPurple",
  "448": "SillyBalloonGreen",
  "449": "SillyStreamerBlue",
  "450": "SillyStreamerGreen",
  "451": "SillyStreamerPink",
  "452": "SillyBalloonMachine",
  "453": "SillyBalloonTile",
  "454": "Pigronata",
  "455": "PartyMonolith",
  "456": "PartyBundleOfBalloonTile",
  "457": "PartyPresent",
  "458": "SandFallBlock",
  "459": "SnowFallBlock",
  "460": "SnowCloud",
  "461": "SandDrip",
  "462": "DjinnLamp",
  "463": "DefendersForge",
  "464": "WarTable",
  "465": "WarTableBanner",
  "466": "ElderCrystalStand",
  "467": "Containers2",
  "468": "FakeContainers2",
  "469": "Tables2",
  "470": "DisplayDoll",
  "471": "WeaponsRack2",
  "472": "IronBrick",
  "473": "LeadBrick",
  "474": "LesionBlock",
  "475": "HatRack",
  "476": "GolfHole",
  "477": "GolfGrass",
  "478": "CrimstoneBrick",
  "479": "SmoothSandstone",
  "480": "BloodMoonMonolith",
  "481": "CrackedBlueDungeonBrick",
  "482": "CrackedGreenDungeonBrick",
  "483": "CrackedPinkDungeonBrick",
  "484": "RollingCactus",
  "485": "AntlionLarva",
  "486": "DrumSet",
  "487": "PicnicTable",
  "488": "FallenLog",
  "489": "PinWheel",
  "490": "WeatherVane",
  "491": "VoidVault",
  "492": "GolfGrassHallowed",
  "493": "GolfCupFlag",
  "494": "GolfTee",
  "495": "ShellPile",
  "496": "AntiPortalBlock",
  "497": "Toilets",
  "498": "Spider",
  "499": "LesionStation",
  "500": "SolarBrick",
  "501": "VortexBrick",
  "502": "NebulaBrick",
  "503": "StardustBrick",
  "504": "MysticSnakeRope",
  "505": "GoldGoldfishBowl",
  "506": "CatBast",
  "507": "GoldStarryGlassBlock",
  "508": "BlueStarryGlassBlock",
  "509": "VoidMonolith",
  "510": "ArrowSign",
  "511": "PaintedArrowSign",
  "512": "GreenMossBrick",
  "513": "BrownMossBrick",
  "514": "RedMossBrick",
  "515": "BlueMossBrick",
  "516": "PurpleMossBrick",
  "517": "LavaMossBrick",
  "518": "LilyPad",
  "519": "Cattail",
  "520": "FoodPlatter",
  "521": "BlackDragonflyJar",
  "522": "BlueDragonflyJar",
  "523": "GreenDragonflyJar",
  "524": "OrangeDragonflyJar",
  "525": "RedDragonflyJar",
  "526": "YellowDragonflyJar",
  "527": "GoldDragonflyJar",
  "528": "MushroomVines",
  "529": "SeaOats",
  "530": "OasisPlants",
  "531": "BoulderStatue",
  "532": "MaggotCage",
  "533": "RatCage",
  "534": "KryptonMoss",
  "535": "KryptonMossBrick",
  "536": "XenonMoss",
  "537": "XenonMossBrick",
  "538": "LadybugCage",
  "539": "ArgonMoss",
  "540": "ArgonMossBrick",
  "541": "EchoBlock",
  "542": "OwlCage",
  "543": "PupfishBowl",
  "544": "GoldLadybugCage",
  "545": "LawnFlamingo",
  "546": "Grate",
  "547": "PottedPlants1",
  "548": "PottedPlants2",
  "549": "Seaweed",
  "550": "TurtleCage",
  "551": "TurtleJungleCage",
  "552": "Sandcastles",
  "553": "GrebeCage",
  "554": "SeagullCage",
  "555": "WaterStriderCage",
  "556": "GoldWaterStriderCage",
  "557": "GrateClosed",
  "558": "SeahorseCage",
  "559": "GoldSeahorseCage",
  "560": "GolfTrophies",
  "561": "MarbleColumn",
  "562": "BambooBlock",
  "563": "LargeBambooBlock",
  "564": "PlasmaLamp",
  "565": "FogMachine",
  "566": "AmberStoneBlock",
  "567": "GardenGnome",
  "568": "PinkFairyJar",
  "569": "GreenFairyJar",
  "570": "BlueFairyJar",
  "571": "Bamboo",
  "572": "SoulBottles",
  "573": "TatteredWoodSign",
  "574": "BorealBeam",
  "575": "RichMahoganyBeam",
  "576": "GraniteColumn",
  "577": "SandstoneColumn",
  "578": "MushroomBeam",
  "579": "RockGolemHead",
  "580": "HellButterflyJar",
  "581": "LavaflyinaBottle",
  "582": "MagmaSnailCage",
  "583": "TreeTopaz",
  "584": "TreeAmethyst",
  "585": "TreeSapphire",
  "586": "TreeEmerald",
  "587": "TreeRuby",
  "588": "TreeDiamond",
  "589": "TreeAmber",
  "590": "GemSaplings",
  "591": "PotsSuspended",
  "592": "BrazierSuspended",
  "593": "VolcanoSmall",
  "594": "VolcanoLarge",
  "595": "VanityTreeSakuraSaplings",
  "596": "VanityTreeSakura",
  "597": "TeleportationPylon",
  "598": "LavafishBowl",
  "599": "AmethystBunnyCage",
  "600": "TopazBunnyCage",
  "601": "SapphireBunnyCage",
  "602": "EmeraldBunnyCage",
  "603": "RubyBunnyCage",
  "604": "DiamondBunnyCage",
  "605": "AmberBunnyCage",
  "606": "AmethystSquirrelCage",
  "607": "TopazSquirrelCage",
  "608": "SapphireSquirrelCage",
  "609": "EmeraldSquirrelCage",
  "610": "RubySquirrelCage",
  "611": "DiamondSquirrelCage",
  "612": "AmberSquirrelCage",
  "613": "PottedLavaPlants",
  "614": "PottedLavaPlantTendrils",
  "615": "VanityTreeWillowSaplings",
  "616": "VanityTreeYellowWillow",
  "617": "MasterTrophyBase",
  "618": "AccentSlab",
  "619": "TruffleWormCage",
  "620": "EmpressButterflyJar",
  "621": "SliceOfCake",
  "622": "TeaKettle",
  "623": "PottedCrystalPlants",
  "624": "AbigailsFlower",
  "625": "VioletMoss",
  "626": "VioletMossBrick",
  "627": "RainbowMoss",
  "628": "RainbowMossBrick",
  "629": "StinkbugCage",
  "630": "StinkbugHousingBlocker",
  "631": "StinkbugHousingBlockerEcho",
  "632": "ScarletMacawCage",
  "633": "AshGrass",
  "634": "TreeAsh",
  "635": "AshWood",
  "636": "CorruptVines",
  "637": "AshPlants",
  "638": "AshVines",
  "639": "ManaCrystal",
  "640": "BlueMacawCage",
  "641": "ReefBlock",
  "642": "ChlorophyteExtractinator",
  "643": "ToucanCage",
  "644": "YellowCockatielCage",
  "645": "GrayCockatielCage",
  "646": "ShadowCandle",
  "647": "LargePilesEcho",
  "648": "LargePiles2Echo",
  "649": "SmallPiles2x1Echo",
  "650": "SmallPiles1x1Echo",
  "651": "PlantDetritus3x2Echo",
  "652": "PlantDetritus2x2Echo",
  "653": "PotsEcho",
  "654": "TNTBarrel",
  "655": "PlanteraThorns",
  "656": "GlowTulip",
  "657": "EchoMonolith",
  "658": "ShimmerMonolith",
  "659": "ShimmerBlock",
  "660": "ShimmerflyinaBottle",
  "661": "CorruptJungleGrass",
  "662": "CrimsonJungleGrass",
  "663": "Moondial",
  "664": "BouncyBoulder",
  "665": "LifeCrystalBoulder",
  "666": "PoopBlock",
  "667": "ShimmerBrick",
  "668": "DirtiestBlock",
  "669": "LunarRustBrick",
  "670": "DarkCelestialBrick",
  "671": "AstraBrick",
  "672": "CosmicEmberBrick",
  "673": "CryocoreBrick",
  "674": "MercuryBrick",
  "675": "StarRoyaleBrick",
  "676": "HeavenforgeBrick",
  "677": "AncientBlueBrick",
  "678": "AncientGreenBrick",
  "679": "AncientPinkBrick",
  "680": "AncientGoldBrick",
  "681": "AncientSilverBrick",
  "682": "AncientCopperBrick",
  "683": "AncientObsidianBrick",
  "684": "AncientHellstoneBrick",
  "685": "AncientCobaltBrick",
  "686": "AncientMythrilBrick",
  "687": "LavaMossBlock",
  "688": "ArgonMossBlock",
  "689": "KryptonMossBlock",
  "690": "XenonMossBlock",
  "691": "VioletMossBlock",
  "692": "RainbowMossBlock"
};

settings.Tiles.forEach(tile => {
  const tileKey = tileKeys[tile.Id];
  if (!tileKey) return;
  const tileName = names[tileKey];
  if (!tileName) return;
  tile.Name = tileName;
});
