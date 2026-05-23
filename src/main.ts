import { settings } from './settings';
import { sets } from './sets';
import { names } from './names';
import { tileKeys } from './tileKeys';
import { itemKeys } from './itemKeys';
import { wallKeys } from './wallKeys';
import { tileColors, liquidColors, wallColors } from './MapHelper';
import './vendor/jquery.mousewheel';
import './vendor/jquery.panzoom';
import './vendor/jquery.hotkeys';
import './vendor/FileSaver';

declare var saveAs: any;

// Apply localized names from names.ts to settings
settings.Tiles.forEach((tile) => {
  const tileKey = tileKeys[tile.Id];
  if (!tileKey) return;
  const tileName = names[tileKey];
  if (!tileName) return;
  if (tileName === "Heart") return;
  tile.Name = tileName;
});
settings.Items.forEach((item) => {
  const itemKey = itemKeys[item.Id];
  if (!itemKey) return;
  const itemName = names[itemKey];
  if (!itemName) return;
  item.Name = itemName;
});
settings.Walls.forEach((wall) => {
  const wallKey = wallKeys[wall.Id];
  if (!wallKey) return;
  const wallName = names[wallKey];
  if (!wallName) return;
  wall.Name = wallName;
});

const canvasContainer = document.querySelector("#canvasContainer") as HTMLDivElement;
const panzoomContainer = document.querySelector("#panzoomContainer") as HTMLCanvasElement;

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const overlayCanvas = document.querySelector("#overlayCanvas") as HTMLCanvasElement;
const selectionCanvas = document.querySelector("#selectionCanvas") as HTMLCanvasElement;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const overlayCtx = overlayCanvas.getContext("2d") as CanvasRenderingContext2D;
const selectionCtx = selectionCanvas.getContext("2d") as CanvasRenderingContext2D;

let pixels: Uint8ClampedArray | null = null;

const blockSelector = document.querySelector("#blocks") as HTMLSelectElement;

(ctx as any).msImageSmoothingEnabled = false;
(ctx as any).mozImageSmoothingEnabled = false;
(ctx as any).msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

(overlayCtx as any).msImageSmoothingEnabled = false;
(overlayCtx as any).mozImageSmoothingEnabled = false;
(overlayCtx as any).msImageSmoothingEnabled = false;
overlayCtx.imageSmoothingEnabled = false;

(selectionCtx as any).msImageSmoothingEnabled = false;
(selectionCtx as any).mozImageSmoothingEnabled = false;
(selectionCtx as any).msImageSmoothingEnabled = false;
selectionCtx.imageSmoothingEnabled = false;

let file: File;

let world: any;

let selectionX: number = 0;
let selectionY: number = 0;

const panzoom: any = ($("#panzoomContainer") as any).panzoom({
  cursor: "default",
  maxScale: 20,
  increment: 0.3,
});

$("#status").html("Checking File APIs...");

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  $("#file").css("visibility", "visible");
  $("#file").on('change', fileNameChanged);
	$("#status").html("Please choose a Terraria .wld file.");
} else {
	$("#status").html("The File APIs are not fully supported in this browser.");
}

resizeCanvases();

const options: HTMLOptionElement[] = [];

addTileSelectOptions();
addItemSelectOptions();
addWallSelectOptions();
sortAndAddSelectOptions();

addSetListItems();

function addSetListItems(): void {
  for(let i = 0; i < sets.length; i++) {
    const set = sets[i];

    for(let j = 0; j < set.Entries.length; j++) {
      const entry = set.Entries[j] as any;
      if(entry.U || entry.V) {
        const tileInfo = getTileInfoFrom(entry.Id, entry.U, entry.V);
        if(tileInfo) {
          set.Entries[j] = tileInfo;
        }
      }
    }

    $("#setList").append('<li><a href="#" onclick="highlightSet(' + i + ')">' + set.Name + '</a></li>');
  }
}

function highlightSet(setIndex: number): void {
  const set = sets[setIndex];

  const selectedValues: any[] = [];

  // clear and set selectedInfos
  for(let j = 0; j < blockSelector.options.length; j++) {
    const option = blockSelector.options[j];

    const tileInfo = getTileInfoFromOption(option);

    if (
      tileInfo &&
      set.Entries.some(
        (entry: any) =>
          ((entry.Id && entry.Id === tileInfo.Id) ||
            (entry.parent &&
              tileInfo.parent &&
              entry.parent.Id === tileInfo.parent.Id)) &&
          (!entry.U || entry.U === tileInfo.U) &&
          (!entry.V || entry.V === tileInfo.V)
      )
    ) {
      // if (option.prop) option.prop("selected", true);
      option.selected = true;
      selectedValues.push(tileInfo.Id);
      // console.log({ tileInfo, option, set });
    } else {
      if ((option as any).prop) (option as any).prop("selected", false);
      option.selected = false;
    }
  }

  // console.log({blockSelector});

  console.log({set});

  // blockSelector.val(selectedValues);

  highlightInfos(set.Entries);
}

function sortAndAddSelectOptions(): void {
  options.sort(compareOptions);

  for(let i = 0; i < options.length; i++) {
    const option = options[i];

    blockSelector.add(option);
  }
}

function addTileSelectOptions(): void {
  for(let i = 0; i < settings.Tiles.length; i++) {
    const tile = settings.Tiles[i];

    tile.isTile = true;

    let option = document.createElement("option");
    option.text = `${tile.Name} (Tile ${i})`;
    option.value = String(i);
    options.push(option);

    if(tile.Frames) {
      for(let frameIndex = 0; frameIndex < tile.Frames.length; frameIndex++) {
        const frame = tile.Frames[frameIndex];
        frame.isTile = true;

        option = document.createElement("option");
        option.text = tile.Name;
        option.value = String(i);

        let attribute = document.createAttribute("data-u");
        attribute.value = String(frame.U);
        option.setAttributeNode(attribute);

        attribute = document.createAttribute("data-v");
        attribute.value = String(frame.V);
        option.setAttributeNode(attribute);

        if(frame.Name) {
          option.text = `${frame.Name} - ${option.text}`;
        }

        if(frame.Variety) {
          option.text = `${frame.Variety} - ${option.text}`;
        }

        option.text += ` (Tile ${i})`;

        options.push(option);
      }
    }
  }
}

function addItemSelectOptions(): void {
  for(let i = 0; i < settings.Items.length; i++) {
    const item = settings.Items[i];

    item.isItem = true;

    const option = document.createElement("option");
    option.text = `${item.Name} (Item ${item.Id})`;
    option.value = `item${item.Id}`;
    options.push(option);
  }
}

function addWallSelectOptions(): void {
  for(let i = 0; i < settings.Walls.length; i++) {
    const wall = settings.Walls[i];

    wall.isWall = true;

    const option = document.createElement("option");
    option.text = `${wall.Name} (Wall)`;
    option.value = `wall${wall.Id}`;
    options.push(option);
  }
}

function compareOptions(a: HTMLOptionElement, b: HTMLOptionElement): number {
  if (a.text < b.text)
    return -1;
  if (a.text > b.text)
    return 1;
  return 0;
}

$('#chooseBlocksModal').on('shown.bs.modal', function () {
  $('#blocksFilter').focus();
});

$(document).bind('keydown', 'ctrl+b', function() {
  ($('#chooseBlocksModal') as any).modal();
});

// filter blocks
(jQuery.fn as any).filterByText = function(textbox: JQuery, selectSingleMatch: boolean) {
    return this.each(function(this: HTMLSelectElement) {
        const select = this;
        const options: Array<{value: string; text: string; u: string | undefined; v: string | undefined}> = [];
        $(select).find('option').each(function() {
            options.push({value: $(this).val() as string, text: $(this).text(), u: $(this).attr('data-u'), v: $(this).attr('data-v')});
        });
        $(select).data('options', options);
        $(textbox).bind('change keyup', function() {
            const options = $(select).empty().data('options') as Array<{value: string; text: string; u: string | undefined; v: string | undefined}>;
            const search = ($ as any).trim($(this).val() as string);
            const regex = new RegExp(search,"gi");

            $.each(options, function(i: number) {
                const option = options[i];
                if(option.text.match(regex) !== null) {
                  const newOption = $('<option>');
                  newOption.text(option.text);
                  newOption.val(option.value);
                  newOption.attr('data-u', option.u as string);
                  newOption.attr('data-v', option.v as string);
                  $(select).append(newOption);
                }
            });
            if (selectSingleMatch === true && $(select).children().length === 1) {
                ($(select).children().get(0) as HTMLOptionElement).selected = true;
            }
        });
    });
};

$(function() {
    ($('#blocks') as any).filterByText($('#blocksFilter'), true);
});

$(window).resize(function () {
  $('body').css('padding-top', parseInt($('#main-navbar').css("height"))+10);
  $('#canvasContainer').css("overflow", "visible");
});

($(window) as any).load(function () {
   $('body').css('padding-top', parseInt($('#main-navbar').css("height"))+10);
});

// handle scrolling in and out
panzoom.parent().on('mousewheel.focal', onMouseWheel);

function onMouseWheel(e: any): void {
  e.preventDefault();

  const delta = e.delta || e.originalEvent.wheelDelta;
  const zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;

  const isTouchPad = Math.abs(delta) < 120;
  const multiplier = isTouchPad ? 0.025 : 0.3;

  // console.log({ isTouchPad, multiplier, delta, zoomOut });

  const transform = $(panzoomContainer).panzoom('getMatrix');
  const scale = transform[0];

  panzoom.panzoom('zoom', zoomOut, {
      increment   : multiplier * scale,
      animate     : true,
      focal       : e
  });
}

$(document).bind('keydown', 'e', zoomIn);
$(document).bind('keydown', 'c', zoomOut);

function zoomIn(): void {
  const transform = $(panzoomContainer).panzoom('getMatrix');
  const scale = transform[0];

  panzoom.panzoom('zoom', false, {
      increment   : 0.3 * scale,
      animate     : true
  });
}

function zoomOut(): void {
  const transform = $(panzoomContainer).panzoom('getMatrix');
  const scale = transform[0];

  panzoom.panzoom('zoom', true, {
      increment   : 0.3 * scale,
      animate     : true
  });
}

function previousBlock(e: any): void {
  findBlock(-1);
}

function nextBlock(e: any): void {
  findBlock(1);
}

function isTileMatch(tile: any, selectedInfos: any[], x?: number, y?: number): boolean {
  for(let j = 0; j < selectedInfos.length; j++) {
    const info = selectedInfos[j];

    // check the tile first
    if(tile.info && info.isTile && (tile.info == info || (!info.parent && tile.Type == info.Id)))
      return true;

    // check the wall
    if(info.isWall && tile.WallType == info.Id)
      return true;

    // see if it's a chest
    const chest = tile.chest;
    if(chest && info.isItem) {
      // see if the chest contains the item
      for(let i = 0; i < chest.items.length; i++) {
        const item = chest.items[i];

        if(info.Id == item.id) {
          return true;
        }
      }
    }

    // check if the tile entity contains it
    const tileEntity = tile.tileEntity;
    if (tileEntity && info.isItem) {
      switch (tileEntity.type) {
        case 1: // item frame
        case 4: // weapon rack
        case 6: // plate
          if (info.Id == tileEntity.item.id) {
            return true;
          }
          break;
        case 3: // (wo)mannequin
        case 5: // hat rack
          for (let i = 0; i < tileEntity.items.length; i++) {
            if (info.Id == tileEntity.items[i].id) {
              return true;
            }
            if (info.Id == tileEntity.dyes[i].id) {
              return true;
            }
          }
          break;
      }
    }
  }

  return false;
}

function findBlock(direction: number): void {
  if(!world)
    return;

  let x: number = selectionX;
  let y: number = selectionY + direction;

  const start = x * world.height + y;

  const selectedInfos = getSelectedInfos();

  if(selectedInfos.length > 0) {
    for(let i = start; i >= 0 && i < world.tiles.length; i += direction) {
      const tile = world.tiles[i];

      let foundMatch = false;

      if(isTileMatch(tile, selectedInfos, x, y)) {
        selectionX = x;
        selectionY = y;

        drawSelectionIndicator();
        // panzoom.panzoom('pan', (-overlayCanvas.width / 2) - x, (-overlayCanvas.height / 2) - y, { relative: false });

        foundMatch = true;

        break;
      }

      y += direction;

      if(y < 0 || y >= world.height) {
        if(direction > 0)
          y = 0;
        else
          y = world.height - 1;
        x += direction;
      }

      if(foundMatch)
        break;
    }
  }
}

function highlightAll(): void {
  if(!world)
    return;

  const selectedInfos = getSelectedInfos();

  highlightInfos(selectedInfos);
}

function highlightInfos(selectedInfos: any[]): void {
  let x: number = 0;
  let y: number = 0;

  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  overlayCtx.fillStyle = "rgba(0, 0, 0, 0.75)";
  overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if(selectedInfos.length > 0) {
    for(let i = 0; i < world.tiles.length; i++) {
      const tile = world.tiles[i];

      if(isTileMatch(tile, selectedInfos)) {
        overlayCtx.fillStyle = "rgb(255, 255, 255)";
        overlayCtx.fillRect(x, y, 1, 1);
      }

      y++;
      if(y >= world.height) {
        y = 0;
        x++;
      }
    }
  }
}

function getSelectedInfos(): any[] {
  const selectedInfos: any[] = [];

  let j: number;
  let option: HTMLOptionElement;

  for(j = 0; j < blockSelector.options.length; j++) {
    option = blockSelector.options[j];
    if(!option.selected)
      continue;

    const tileInfo = getTileInfoFromOption(option);

    if(tileInfo) {
      selectedInfos.push(tileInfo);
    }
    else {
      const itemInfo = getItemInfoFromOption(option);
      if(itemInfo) {
        selectedInfos.push(itemInfo);
      }
      else {
        const wallInfo = getWallInfoFromOption(option);
        if(wallInfo) {
          selectedInfos.push(wallInfo);
        }
      }
    }
  }

  return selectedInfos;
}

function getTileInfoFromOption(option: HTMLOptionElement): any {
  const tileInfo = getTileInfoFrom(option.value, option.getAttribute("data-u"), option.getAttribute("data-v"));

  return tileInfo;
}

function getTileInfoFrom(id: any, u: any, v: any): any {
  const tileInfo = settings.Tiles[id];

  if(tileInfo && tileInfo.Frames) {
    for(let frameIndex = 0; frameIndex < tileInfo.Frames.length; frameIndex++) {
      const frame = tileInfo.Frames[frameIndex];

      if(u != frame.U)
        continue;

      if(v != frame.V)
        continue;

      frame.parent = tileInfo;

      return frame;
    }
  }

  return tileInfo;
}

function getItemInfoFromOption(option: HTMLOptionElement): any | null {
  for(let i = 0; i < settings.Items.length; i++) {
    const item = settings.Items[i];

    if(option.value == `item${item.Id}`) {
      return item;
    }
  }

  return null;
}

function getWallInfoFromOption(option: HTMLOptionElement): any | null {
  for(let i = 0; i < settings.Walls.length; i++) {
    const wall = settings.Walls[i];

    if(option.value == `wall${wall.Id}`) {
      return wall;
    }
  }

  return null;
}

function getTileInfo(tile: any): any {
  const tileInfo = settings.Tiles[tile.Type];

  if(!tileInfo) return tileInfo;

  if(!tileInfo.Frames)
    return tileInfo;

  let matchingFrame: any;

  for(let i = 0; i < tileInfo.Frames.length; i++) {
    const frame = tileInfo.Frames[i];

    if((!frame.U && !tile.TextureU) || (frame.U ?? 0) <= tile.TextureU) {
      if((!frame.V && !tile.TextureV) || (frame.V ?? 0) <= tile.TextureV)
        matchingFrame = frame;
    }
  }

  if(!matchingFrame)
    return tileInfo;

  matchingFrame.parent = tileInfo;

  return matchingFrame;
}

function clearHighlight(): void {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
}

function clearSelection(): void {
  selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
}

function resetPanZoom(e?: any): void {
  panzoom.panzoom('reset');
}

function resizeCanvases(): void {
  const width = window.innerWidth * 0.99;

  const ratio = panzoomContainer.height/panzoomContainer.width;
  const height = width * ratio;

  panzoomContainer.style.width = width+'px';
  panzoomContainer.style.height = height+'px';
  canvas.style.width = width+'px';
  overlayCanvas.style.width = width+'px';
  selectionCanvas.style.width = width + 'px';
  $('#canvasContainer').css("overflow", "visible");
}

function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent): {x: number; y: number} {
  const rect = panzoomContainer.getBoundingClientRect();
  const transform = ($(panzoomContainer) as any).panzoom('getMatrix');

  let scale: number = transform[0];

  scale = rect.width / panzoomContainer.width;

  const mousePos = {
    x: Math.floor((evt.clientX - rect.left) / scale),
    y: Math.floor((evt.clientY - rect.top) / scale)
  };

  // console.log(`${evt.clientX}\t${evt.clientY}\t${rect.left}\t${rect.top}\t${scale}\t${mousePos.x}\t${mousePos.y}`);

  return mousePos;
}

function getItemText(item: any): string {
  let prefix = "";

  if(item.prefixId > 0 && item.prefixId < settings.ItemPrefix.length)
    prefix = settings.ItemPrefix[item.prefixId].Name;

  let itemName = item.id;
  for(let itemIndex = 0; itemIndex < settings.Items.length; itemIndex++) {
    let itemSettings = settings.Items[itemIndex];
    if(Number(itemSettings.Id) === item.id) {
      itemName = itemSettings.Name;
      break;
    }
  }
  return `${prefix} ${itemName} (${item.count})`;
}

panzoomContainer.addEventListener('mousemove', (evt: MouseEvent) => {
  if(!world)
    return;

  const mousePos = getMousePos(panzoomContainer, evt);
  const x = mousePos.x;
  const y = mousePos.y;

  $("#status").html(mousePos.x + ',' + (mousePos.y));

  if(world.tiles) {
    const tile = getTileAt(mousePos.x, mousePos.y);

    if(tile) {
      const text = getTileText(tile);

      $("#status").html(`${text} (${mousePos.x}, ${mousePos.y})`);
    }
  }
});

$("#panzoomContainer").on('panzoomend', function(evt: any, panzoom: any, matrix: any, changed: boolean) {
  if (changed) return;

  const mousePos = getMousePos(panzoomContainer, evt);
  const x = mousePos.x;
  const y = mousePos.y;

  selectionX = x;
  selectionY = y;

  drawSelectionIndicator();

  const tile = getTileAt(x, y);
  if(tile) {
    let text = getTileText(tile);

    $("#tileInfoList").html("");

    const chest = tile.chest;
    if(chest) {
      if(chest.name.length > 0)
      text = `${text} - ${chest.name}`;

      for(let i = 0; i < chest.items.length; i++) {
        const item = chest.items[i];
        const itemText = getItemText(item);

        $("#tileInfoList").append(`<li>${itemText}</li>`);
      }
    }

    const tileEntity = tile.tileEntity;
    if (tileEntity) {
      switch (tileEntity.type) {
        case 3: // mannequin
        case 5: // hat rack
          const items = tileEntity.items;
          const dyes = tileEntity.dyes;
          const itemLength = items.length;
          for (let i = 0; i < itemLength; i++) {
            const item = items[i];
            if (item.id > 0) {
              $("#tileInfoList").append(`<li>${getItemText(item)}</li>`);
            }
            const dye = dyes[i];
            if (dye.id > 0) {
              $("#tileInfoList").append(`<li>${getItemText(dye)}</li>`);
            }
          }
          break;
      }
    }

    const sign = tile.sign;
    if(sign && sign.text) {
      if(sign.text.length > 0)
        $("#tileInfoList").append(`<li>${sign.text}</li>`);
    }

    $("#tile").html(text);
  }

});

function getTileAt(x: number, y: number): any {
  if(!world) return;

  const index = x * world.height + y;
  if(index >= 0 && index < world.tiles.length) {
    return world.tiles[index];
  }

  return null;
}

function selectPoint(x: number, y: number): void {
  selectionX = x;
  selectionY = y;
  drawSelectionIndicator();
}

function drawSelectionIndicator(): void {
  const x = selectionX + 0.5;
  const y = selectionY + 0.5;

  const lineWidth = 12;
  const targetWidth = 39;
  const halfTargetWidth = targetWidth / 2;

  selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
  selectionCtx.lineWidth = lineWidth;
  selectionCtx.strokeStyle="rgb(255, 0, 0)";
  selectionCtx.strokeRect(x - halfTargetWidth, y - halfTargetWidth, targetWidth, targetWidth);

  // draw cross-hairs
  selectionCtx.lineWidth=1;
  selectionCtx.beginPath();
  selectionCtx.moveTo(x - halfTargetWidth, y);
  selectionCtx.lineTo(x - 1, y);
  selectionCtx.stroke();
  selectionCtx.beginPath();
  selectionCtx.moveTo(x + halfTargetWidth, y);
  selectionCtx.lineTo(x + 1, y);
  selectionCtx.stroke();
  selectionCtx.beginPath();
  selectionCtx.moveTo(x, y - halfTargetWidth);
  selectionCtx.lineTo(x, y - 1);
  selectionCtx.stroke();
  selectionCtx.beginPath();
  selectionCtx.moveTo(x, y + halfTargetWidth);
  selectionCtx.lineTo(x, y + 1);
  selectionCtx.stroke();
}

function getTileText (tile: any): string {
  let text = "Nothing";

  if(!tile) {
    return text;
  }

  const tileInfo = tile.info;

  if(tileInfo) {
    if(!tileInfo.parent || !tileInfo.parent.Name) {
       text = tileInfo.Name;
    }
    else if(tileInfo.parent && tileInfo.parent.Name) {
      text = tileInfo.parent.Name;

      if(tileInfo.Name) {
        text = `${text} - ${tileInfo.Name}`;

        if(tileInfo.Variety)
        text = `${text} - ${tileInfo.Variety}`;
      }
      else if (tileInfo.Variety) {
        text = `${text} - ${tileInfo.Variety}`;
      }
    }

    if(tile.TextureU > 0 && tile.TextureV > 0)
      text = `${text} (${tile.Type}, ${tile.TextureU}, ${tile.TextureV})`;
    else if(tile.TextureU > 0)
      text = `${text} (${tile.Type}, ${tile.TextureU})`;
    else
      text = `${text} (${tile.Type})`;
    if (tile.tileEntity) {
      const tileEntity = tile.tileEntity;
      switch (tileEntity.type) {
        case 1: // item frame
        case 4: // weapon rack
        case 6: // plate
          const item = tileEntity.item;
          const itemText = getItemText(item);
          text = `${text} - ${itemText}`;
          break;
        case 2: // logic sensor
          const checkType = tile.info.CheckTypes[tileEntity.logicCheckType];
          const on = tileEntity.on ? "On" : "Off";
          text = `${text} - ${checkType}, ${on}`;
          break;
      }
    }
  }
  else if (tile.WallType || tile.WallType === 0) {
    if(tile.WallType < settings.Walls.length) {
      text = `${settings.Walls[tile.WallType].Name} (${tile.WallType})`;
    }
    else {
      text = `Unknown Wall (${tile.WallType})`;
    }
  }

  if (tile.IsLiquidPresent) {
    if (text === "Nothing") text = "";

    if(tile.IsLiquidLava) {
      text += text ? " Lava" : "Lava";
    }
    else if (tile.IsLiquidHoney) {
      text += text ? " Honey" : "Honey";
    }
    else if (tile.Shimmer) {
      text += text ? " Shimmer" : "Shimmer";
    }
    else {
      text += text ? " Water" : "Water";
    }
  }

  if(tile.IsRedWirePresent)
    text += " (Red Wire)";

  if(tile.IsGreenWirePresent)
    text += " (Green Wire)";

  if(tile.IsBlueWirePresent)
    text += " (Blue Wire)";

  if(tile.IsYellowWirePresent)
    text += " (Yellow Wire)";

  return text;
}

function fileNameChanged (evt: Event): void {
  file = (evt.target as HTMLInputElement).files![0];

  $("#help").hide();

  reloadWorld();
}

function reloadWorld(): void {
  const worker = new Worker(new URL('./WorldLoader.ts', import.meta.url), { type: 'module' });
  worker.addEventListener('message', onWorldLoaderWorkerMessage);

  worker.postMessage(file);
}

function onWorldLoaderWorkerMessage(e: MessageEvent): void {
  if(e.data.status)
    $("#status").html(e.data.status);

  if (e.data.tiles) {
    const bufferWidth = 200;
    if (!pixels) {
      pixels = new Uint8ClampedArray(4 * bufferWidth * world.height);
    }
    const xlimit = e.data.x + e.data.tiles.length / world.height;
    let i = 0;
    for (let x = e.data.x; x < xlimit; x++) {
      const bufferStart = bufferWidth * Math.floor(x / bufferWidth);
      if (x % bufferWidth === 0 && x > 0) {
        const imageData = new ImageData(pixels as unknown as Uint8ClampedArray<ArrayBuffer>, bufferWidth);
        ctx.putImageData(imageData, bufferStart - bufferWidth, 0);
      }
      for (let y = 0; y < world.height; y++) {
        const tile = e.data.tiles[i++];
        if (tile) {
          tile.info = getTileInfo(tile);
          world.tiles.push(tile);

          let c = getTileColor(y, tile, world);
          if (!c) c = { "r": 0, "g": 0, "b": 0 };

          const pxIdx = 4 * (y * bufferWidth + x - bufferStart);
          pixels[pxIdx] = c.r;
          pixels[pxIdx + 1] = c.g;
          pixels[pxIdx + 2] = c.b;
          pixels[pxIdx + 3] = 255;
        }
      }
    }
  }

  if (e.data.done) {
    const bufferWidth = 200;
    const bufferStart =
      bufferWidth * Math.floor((world.width - 1) / bufferWidth);
    const imageData = new ImageData(pixels as unknown as Uint8ClampedArray<ArrayBuffer>, bufferWidth);
    ctx.putImageData(imageData, bufferStart, 0);
    pixels = null;
  }

  if(e.data.chests) {
    world.chests = e.data.chests;

    for(let i = 0; i < e.data.chests.length; i++) {
      const chest = e.data.chests[i];

      let idx = chest.x * world.height + chest.y;
      world.tiles[idx].chest = chest;
      world.tiles[idx + 1].chest = chest;

      idx = (chest.x + 1) * world.height + chest.y;
      world.tiles[idx].chest = chest;
      world.tiles[idx + 1].chest = chest;
    }
  }

  if(e.data.signs) {
    world.signs = e.data.signs;

    for(let i = 0; i < e.data.signs.length; i++) {
      const sign = e.data.signs[i];

      let tileIndex = sign.x * world.height + sign.y;
      world.tiles[tileIndex].sign = sign;
      world.tiles[tileIndex + 1].sign = sign;

      tileIndex = (sign.x + 1) * world.height + sign.y;
      world.tiles[tileIndex].sign = sign;
      world.tiles[tileIndex + 1].sign = sign;
    }
  }

  if(e.data.npcs) {
    addNpcs(e.data.npcs);
  }

  if (e.data.tileEntities) {
    for (const [pos, entity] of e.data.tileEntities.entries()) {
      let idx = pos.x * world.height + pos.y;
      const tile = world.tiles[idx];
      if (tile) {
        const size = tile.info.Size;
        let sizeX = 1;
        let sizeY = 1;
        if (size) {
          sizeX = parseInt(size[0]);
          sizeY = parseInt(size[2]);
        }
        for (let x = 0; x < sizeX; x++) {
          for (let y = 0; y < sizeY; y++) {
            const idx = (pos.x+x) * world.height + pos.y+y;
            world.tiles[idx].tileEntity = entity;
          }
        }
      }
    }
  }

  if(e.data.world) {
    world = e.data.world;

    panzoomContainer.width = world.width;
    panzoomContainer.height = world.height;
    canvas.width = world.width;
    canvas.height = world.height;
    overlayCanvas.width = world.width;
    overlayCanvas.height = world.height;
    selectionCanvas.width = world.width;
    selectionCanvas.height = world.height;

    world.tiles = [];

    resizeCanvases();

    $("#worldPropertyList").empty();

    Object.keys(world).filter((key: string) => {
      const value = world[key];
      const type = typeof value;
      return type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint';
    }).sort()
    .forEach((key: string) =>
      $("#worldPropertyList").append(`<li>${key}: ${world[key]}</li>`)
    );
  }
}

function addNpcs(npcs: any[]): void {
  world.npcs = npcs;

  for(let i = 0; i < npcs.length; i++) {
    const npc = npcs[i];

    let npcText = npc.name;
    if(npc.type != npc.name) {
      npcText = `${npcText} the ${npc.type}`;
    }

    $("#npcList").append(`<li><a href="#" onclick="selectPoint(${npc.x}, ${npc.y})">${npcText}</a></li>`);
  }
}

function getTileColor(y: number, tile: any, world: any): {r: number; g: number; b: number} | undefined {
  if(tile.IsActive && tileColors.length > tile.Type) {
    return tileColors[tile.Type][0];
  }

  if (tile.IsLiquidPresent) {
    if(tile.IsLiquidLava)
      return liquidColors[1];
    else if (tile.IsLiquidHoney)
      return liquidColors[2];
    else if (tile.Shimmer)
      return liquidColors[3];
    else
      return liquidColors[0];
  }

  if (tile.IsWallPresent) {
    const color = wallColors[tile.WallType][0];
    if (!color || (color.r === 0 && color.g === 0 && color.b === 0)) {
      const wall = settings.Walls.find((w) => w.Id === tile.WallType.toString());
      if (wall && wall.Color) return wall.Color as any;
    }
    return color;
  }

  if(y < world.worldSurfaceY)
    return { "r": 132, "g": 170, "b": 248 };

  if(y < world.rockLayerY)
    return { "r": 88, "g": 61, "b": 46 };

  if(y < world.hellLayerY)
    return { "r": 74, "g": 67, "b": 60 };

  return { "r": 0, "g": 0, "b": 0 };
}

function saveMapImage(): void {
  const newCanvas = document.createElement("canvas");
  const newContext = newCanvas.getContext("2d") as CanvasRenderingContext2D;

  newCanvas.height = world.height;
  newCanvas.width = world.width;

  newContext.drawImage(canvas, 0, 0);
  newContext.drawImage(overlayCanvas, 0, 0);
  newContext.drawImage(selectionCanvas, 0, 0);

  newCanvas.toBlob(function(blob: Blob | null) {
    saveAs(blob, `${world.name}.png`);
  });
}

Object.assign(window, { previousBlock, nextBlock, highlightAll, clearHighlight, resetPanZoom, saveMapImage, reloadWorld, highlightSet, selectPoint });
