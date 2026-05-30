import type { BlockSet } from './types/settings';

export const sets: BlockSet[] = [
  {
    name: "Chests",
    entries: [
      { id: 21, name: "Chest", isTile: true },
      { id: 467, name: "Chest (Group 2)", isTile: true }
    ]
  },
  {
    name: "Corruption Blocks",
    entries: [
      { id: 23, name: "Corrupt Grass Block", isTile: true },
      { id: 24, name: "Corruption Short Plants", isTile: true },
      { id: 25, name: "Ebonstone Block", isTile: true },
      { id: 32, name: "Corruption Thorns", isTile: true },
      { id: 112, name: "Ebonsand Block", isTile: true },
      { id: 163, name: "Purple Ice Block", isTile: true },
      { id: 398, name: "Corrupt Hardened Sand Block", isTile: true },
      { id: 400, name: "Corrupt Sandstone Block", isTile: true },
      { id: 636, name: "Corrupt Vines", isTile: true },
      { id: 661, name: "Corrupt Jungle Grass Block", isTile: true }
    ]
  },
  {
    name: "Crimson Blocks",
    entries: [
      { id: 199, name: "Crimson Grass Block", isTile: true },
      { id: 200, name: "Red Ice Block", isTile: true },
      { id: 201, name: "Crimson Short Plants", isTile: true },
      { id: 203, name: "Crimstone Block", isTile: true },
      { id: 205, name: "Crimson Vines", isTile: true },
      { id: 234, name: "Crimsand Block", isTile: true },
      { id: 352, name: "Crimtane Thorns", isTile: true },
      { id: 399, name: "Crimson Hardened Sand Block", isTile: true },
      { id: 401, name: "Crimson Sandstone Block", isTile: true },
      { id: 662, name: "Crimson Jungle Grass Block", isTile: true }
    ]
  },
  {
    name: "Enchanted Items",
    entries: [
      { id: 55, name: "Enchanted Boomerang", isItem: true },
      { id: 187, name: "3x2 Decos - Enchanted Sword", u: 918, v: 0, isTile: true },
      { id: 989, name: "Enchanted Sword", isItem: true }
    ]
  },
  {
    name: "Hallow Blocks",
    entries: [
      { id: 109, name: "Hallowed Grass Block", isTile: true },
      { id: 110, name: "Hallow Short Plants", isTile: true },
      { id: 113, name: "Hallow Tall Plants", isTile: true },
      { id: 115, name: "Hallowed Vines", isTile: true },
      { id: 116, name: "Pearlsand Block", isTile: true },
      { id: 117, name: "Pearlstone Block", isTile: true },
      { id: 164, name: "Pink Ice Block", isTile: true },
      { id: 402, name: "Hallow Hardened Sand Block", isTile: true },
      { id: 403, name: "Hallow Sandstone Block", isTile: true },
      { id: 492, name: "Hallowed Mowed Grass Block", isTile: true }
    ]
  },
  {
    name: "Item Spawning Statues",
    entries: [
      { id: 105, name: "Bomb Statue", isItem: true, u: 612, v: 0 },
      { id: 105, name: "Bomb Statue", isItem: true, u: 612, v: 162 },
      { id: 105, name: "Heart Statue", isItem: true, u: 1332, v: 0 },
      { id: 105, name: "Heart Statue", isItem: true, u: 1332, v: 162 },
      { id: 105, name: "Star Statue", isTile: true, u: 72, v: 0 },
      { id: 105, name: "Star Statue", isTile: true, u: 72, v: 162 }
    ]
  },
  {
    name: "Life Crystals & Fruit",
    entries: [
      { id: 12, name: "Life Crystal", isTile: true },
      { id: 29, name: "Life Crystal", isItem: true },
      { id: 236, name: "Life Fruit", isTile: true },
      { id: 1291, name: "Life Fruit", isItem: true },
    ]
  },
  {
    name: "Locked Chests",
    entries: [
      { id: 21, isTile: true, u: 72, v: 0, name: "Gold Chest", variety: "Locked" },
      { id: 21, isTile: true, u: 144, v: 0, name: "Shadow Chest", variety: "Locked" },
      { id: 21, isTile: true, u: 828, v: 0, name: "Jungle Chest", variety: "Locked" },
      { id: 21, isTile: true, u: 864, v: 0, name: "Corruption Chest", variety: "Locked" },
      { id: 21, isTile: true, u: 900, v: 0, name: "Crimson Chest", variety: "Locked" },
      { id: 21, isTile: true, u: 936, v: 0, name: "Hallowed Chest", variety: "Locked" },
      { id: 21, isTile: true, u: 972, v: 0, name: "Frozen Chest", variety: "Locked" },
      { id: 21, isTile: true, u: 1296, v: 0, name: "Green Dungeon Chest", variety: "Locked" },
      { id: 21, isTile: true, u: 1368, v: 0, name: "Pink Dungeon Chest", variety: "Locked" },
      { id: 21, isTile: true, u: 1440, v: 0, name: "Blue Dungeon Chest", variety: "Locked" },
      { id: 467, isTile: true, u: 468, v: 0, name: "Desert Chest", variety: "Locked" },
    ]
  },
  {
    name: "Spider Caves",
    entries: [
      { id: 62, name: "Infested Spider Wall", isWall: true },
      { id: 21, name: "Web Covered Chest", u: 540, v: 0, isTile: true },
      { id: 939, name: "Web Slinger", isItem: true }
    ]
  }
]
