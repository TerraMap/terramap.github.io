import type { BlockSet } from './types/settings';

export const sets: BlockSet[] = [
  {
    Name: "Chests",
    Entries: [
      {
        Id: "21",
        Name: "Chest",
        isTile: true
      },
      {
        Id: "467",
        Name: "Chest (Group 2)",
        isTile: true
      }
    ]
  },
  {
    Name: "Corruption Blocks",
    Entries: [
      {
        Id: "23",
        Name: "Corrupt Grass Block",
        isTile: true
      },
      {
        Id: "24",
        Name: "Corruption Short Plants",
        isTile: true
      },
      {
        Id: "25",
        Name: "Ebonstone Block",
        isTile: true
      },
      {
        Id: "32",
        Name: "Corruption Thorns",
        isTile: true
      },
      {
        Id: "112",
        Name: "Ebonsand Block",
        isTile: true
      },
      {
        Id: "163",
        Name: "Purple Ice Block",
        isTile: true
      },
      {
        Id: "398",
        Name: "Corrupt Hardened Sand Block",
        isTile: true
      },
      {
        Id: "400",
        Name: "Corrupt Sandstone Block",
        isTile: true
      },
      {
        Id: "636",
        Name: "Corrupt Vines",
        isTile: true
      },
      {
        Id: "661",
        Name: "Corrupt Jungle Grass Block",
        isTile: true
      }
    ]
  },
  {
    Name: "Crimson Blocks",
    Entries: [
      {
        Id: "199",
        Name: "Crimson Grass Block",
        isTile: true
      },
      {
        Id: "200",
        Name: "Red Ice Block",
        isTile: true
      },
      {
        Id: "201",
        Name: "Crimson Short Plants",
        isTile: true
      },
      {
        Id: "203",
        Name: "Crimstone Block",
        isTile: true
      },
      {
        Id: "205",
        Name: "Crimson Vines",
        isTile: true
      },
      {
        Id: "234",
        Name: "Crimsand Block",
        isTile: true
      },
      {
        Id: "352",
        Name: "Crimtane Thorns",
        isTile: true
      },
      {
        Id: "399",
        Name: "Crimson Hardened Sand Block",
        isTile: true
      },
      {
        Id: "401",
        Name: "Crimson Sandstone Block",
        isTile: true
      },
      {
        Id: "662",
        Name: "Crimson Jungle Grass Block",
        isTile: true
      }
    ]
  },
  {
    Name: "Enchanted Items",
    Entries: [
      {
        Id: "55",
        Name: "Enchanted Boomerang",
        isItem: true
      },
      {
        Id: "187",
        Name: "3x2 Decos - Enchanted Sword",
        U: 918, V: 0,
        isTile: true
      },
      {
        Id: "989",
        Name: "Enchanted Sword",
        isItem: true
      }
    ]
  },
  {
    Name: "Hallow Blocks",
    Entries: [
      {
        Id: "109",
        Name: "Hallowed Grass Block",
        isTile: true
      },
      {
        Id: "110",
        Name: "Hallow Short Plants",
        isTile: true
      },
      {
        Id: "113",
        Name: "Hallow Tall Plants",
        isTile: true
      },
      {
        Id: "115",
        Name: "Hallowed Vines",
        isTile: true
      },
      {
        Id: "116",
        Name: "Pearlsand Block",
        isTile: true
      },
      {
        Id: "117",
        Name: "Pearlstone Block",
        isTile: true
      },
      {
        Id: "164",
        Name: "Pink Ice Block",
        isTile: true
      },
      {
        Id: "402",
        Name: "Hallow Hardened Sand Block",
        isTile: true
      },
      {
        Id: "403",
        Name: "Hallow Sandstone Block",
        isTile: true
      },
      {
        Id: "492",
        Name: "Hallowed Mowed Grass Block",
        isTile: true
      }
    ]
  },
  {
    Name: "Item Spawning Statues",
    Entries: [
      {
        Id: "105",
        Name: "Bomb Statue",
        isItem: true,
        U: 612,
        V: 0
      },
      {
        Id: "105",
        Name: "Bomb Statue",
        isItem: true,
        U: 612,
        V: 162
      },
      {
        Id: "105",
        Name: "Heart Statue",
        isItem: true,
        U: 1332,
        V: 0
      },
      {
        Id: "105",
        Name: "Heart Statue",
        isItem: true,
        U: 1332,
        V: 162
      },
      {
        Id: "105",
        Name: "Star Statue",
        isTile: true,
        U: 72,
        V: 0
      },
      {
        Id: "105",
        Name: "Star Statue",
        isTile: true,
        U: 72,
        V: 162
      }
    ]
  },
  {
    Name: "Life Crystals & Fruit",
    Entries: [
      {
        Id: "12",
        Name: "Life Crystal",
        isTile: true,
      },
      {
        Id: "29",
        Name: "Life Crystal",
        isItem: true,
      },
      {
        Id: "236",
        Name: "Life Fruit",
        isTile: true,
      },
      {
        Id: "1291",
        Name: "Life Fruit",
        isItem: true,
      },
    ]
  },
  {
    Name: "Locked Chests",
    Entries: [
      { Id: "21", isTile: true, U: 72, V: 0, Name: "Gold Chest", Variety: "Locked" },
      { Id: "21", isTile: true, U: 144, V: 0, Name: "Shadow Chest", Variety: "Locked" },
      { Id: "21", isTile: true, U: 828, V: 0, Name: "Jungle Chest", Variety: "Locked" },
      { Id: "21", isTile: true, U: 864, V: 0, Name: "Corruption Chest", Variety: "Locked" },
      { Id: "21", isTile: true, U: 900, V: 0, Name: "Crimson Chest", Variety: "Locked" },
      { Id: "21", isTile: true, U: 936, V: 0, Name: "Hallowed Chest", Variety: "Locked" },
      { Id: "21", isTile: true, U: 972, V: 0, Name: "Frozen Chest", Variety: "Locked" },
      { Id: "21", isTile: true, U: 1296, V: 0, Name: "Green Dungeon Chest", Variety: "Locked" },
      { Id: "21", isTile: true, U: 1368, V: 0, Name: "Pink Dungeon Chest", Variety: "Locked" },
      { Id: "21", isTile: true, U: 1440, V: 0, Name: "Blue Dungeon Chest", Variety: "Locked" },
      { Id: "467", isTile: true, U: 468, V: 0, Name: "Desert Chest", Variety: "Locked" },
    ]
  },
  {
    Name: "Spider Caves",
    Entries: [
      {
        Id: "62",
        Name: "Infested Spider Wall",
        isWall: true
      },
      {
        Id: "21",
        Name: "Web Covered Chest",
        U: 540, V: 0,
        isTile: true
      },
      {
        Id: "939",
        Name: "Web Slinger",
        isItem: true
      }
    ]
  }
]
