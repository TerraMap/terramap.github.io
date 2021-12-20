var canvasContainer = document.querySelector("#canvasContainer");
var panzoomContainer = document.querySelector("#panzoomContainer");

var canvas = document.querySelector("#canvas");
var overlayCanvas = document.querySelector("#overlayCanvas");
var selectionCanvas = document.querySelector("#selectionCanvas");

var ctx = canvas.getContext("2d");
var overlayCtx = overlayCanvas.getContext("2d");
var selectionCtx = selectionCanvas.getContext("2d");

// var canvasContextImageData = ctx.createImageData(1,1);
// var imageData = canvasContextImageData.data;

var blockSelector = document.querySelector("#blocks");

ctx.msImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

overlayCtx.msImageSmoothingEnabled = false;
overlayCtx.mozImageSmoothingEnabled = false;
overlayCtx.msImageSmoothingEnabled = false;
overlayCtx.imageSmoothingEnabled = false;

selectionCtx.msImageSmoothingEnabled = false;
selectionCtx.mozImageSmoothingEnabled = false;
selectionCtx.msImageSmoothingEnabled = false;
selectionCtx.imageSmoothingEnabled = false;

var file;

var world;

var selectionX = 0;
var selectionY = 0;

var panzoom = $("#panzoomContainer").panzoom({
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

var options = [];

addTileSelectOptions();
addItemSelectOptions();
addWallSelectOptions();
sortAndAddSelectOptions();

addSetListItems();

function addSetListItems() {
  for(var i = 0; i < sets.length; i++) {
    var set = sets[i];

    for(var j = 0; j < set.Entries.length; j++) {
      var entry = set.Entries[j];
      if(entry.U || entry.V) {
        var tileInfo = getTileInfoFrom(entry.Id, entry.U, entry.V);
        if(tileInfo) {
          set.Entries[j] = tileInfo;
        }
      }
    }

    $("#setList").append('<li><a href="#" onclick="highlightSet(' + i + ')">' + set.Name + '</a></li>');
  }
}

function highlightSet(setIndex) {
  var set = sets[setIndex];

  highlightInfos(set.Entries);
}

function sortAndAddSelectOptions() {
  options.sort(compareOptions);

  for(var i = 0; i < options.length; i++) {
    var option = options[i];

    blockSelector.add(option);
  }
}

function addTileSelectOptions() {
  for(var i = 0; i < settings.Tiles.length; i++) {
    var tile = settings.Tiles[i];

    tile.isTile = true;

    var option = document.createElement("option");
    option.text = tile.Name;
    option.value = i;
    options.push(option);

    if(tile.Frames) {
      for(var frameIndex = 0; frameIndex < tile.Frames.length; frameIndex++) {
        var frame = tile.Frames[frameIndex];
        frame.isTile = true;

        option = document.createElement("option");
        option.text = tile.Name;
        option.value = i;

        var attribute = document.createAttribute("data-u");
        attribute.value = frame.U;
        option.setAttributeNode(attribute);

        attribute = document.createAttribute("data-v");
        attribute.value = frame.V;
        option.setAttributeNode(attribute);

        if(frame.Name) {
          option.text = `${option.text} - ${frame.Name}`;
        }

        if(frame.Variety) {
          option.text = `${option.text} - ${frame.Variety}`;
        }

        option.text += " (Tile)";

        options.push(option);
      }
    }
  }
}

function addItemSelectOptions() {
  for(var i = 0; i < settings.Items.length; i++) {
    var item = settings.Items[i];

    item.isItem = true;

    var option = document.createElement("option");
    option.text = `${item.Name} (Item)`;
    option.value = `item${item.Id}`;
    options.push(option);
  }
}

function addWallSelectOptions() {
  for(var i = 0; i < settings.Walls.length; i++) {
    var wall = settings.Walls[i];

    wall.isWall = true;

    var option = document.createElement("option");
    option.text = `${wall.Name} (Wall)`;
    option.value = `wall${wall.Id}`;
    options.push(option);
  }
}

function compareOptions(a,b) {
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
  $('#chooseBlocksModal').modal();
});

// filter blocks
jQuery.fn.filterByText = function(textbox, selectSingleMatch) {
    return this.each(function() {
        var select = this;
        var options = [];
        $(select).find('option').each(function() {
            options.push({value: $(this).val(), text: $(this).text(), u: $(this).attr('data-u'), v: $(this).attr('data-v')});
        });
        $(select).data('options', options);
        $(textbox).bind('change keyup', function() {
            var options = $(select).empty().data('options');
            var search = $.trim($(this).val());
            var regex = new RegExp(search,"gi");

            $.each(options, function(i) {
                var option = options[i];
                if(option.text.match(regex) !== null) {
                  var newOption = $('<option>');
                  newOption.text(option.text);
                  newOption.val(option.value);
                  newOption.attr('data-u', option.u);
                  newOption.attr('data-v', option.v);
                  $(select).append(newOption);
                }
            });
            if (selectSingleMatch === true && $(select).children().length === 1) {
                $(select).children().get(0).selected = true;
            }
        });
    });
};

$(function() {
    $('#blocks').filterByText($('#blocksFilter'), true);
});

$(window).resize(function () {
  $('body').css('padding-top', parseInt($('#main-navbar').css("height"))+10);
  $('#canvasContainer').css("overflow", "visible");
});

$(window).load(function () {
   $('body').css('padding-top', parseInt($('#main-navbar').css("height"))+10);
});

// handle scrolling in and out
panzoom.parent().on('mousewheel.focal', onMouseWheel);

function onMouseWheel(e) {
  e.preventDefault();

  var delta = e.delta || e.originalEvent.wheelDelta;
  var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;

  var transform = $(panzoomContainer).panzoom('getMatrix');
  var scale = transform[0];

  panzoom.panzoom('zoom', zoomOut, {
      increment   : 0.3 * scale,
      animate     : true,
      focal       : e
  });
}

$(document).bind('keydown', 'e', zoomIn);
$(document).bind('keydown', 'c', zoomOut);

function zoomIn() {
  var transform = $(panzoomContainer).panzoom('getMatrix');
  var scale = transform[0];

  panzoom.panzoom('zoom', false, {
      increment   : 0.3 * scale,
      animate     : true
  });
}

function zoomOut() {
  var transform = $(panzoomContainer).panzoom('getMatrix');
  var scale = transform[0];

  panzoom.panzoom('zoom', true, {
      increment   : 0.3 * scale,
      animate     : true
  });
}

function previousBlock(e) {
  findBlock(-1);
}

function nextBlock(e) {
  findBlock(1);
}

function isTileMatch(tile, selectedInfos, x, y) {
  for(var j = 0; j < selectedInfos.length; j++) {
    var info = selectedInfos[j];

    // check the tile first
    if(tile.info && info.isTile && (tile.info == info || (!info.parent && tile.Type == info.Id)))
      return true;

    // check the wall
    if(info.isWall && tile.WallType == info.Id)
      return true;

    // see if it's a chest
    var chest = tile.chest;
    if(chest && info.isItem) {
      // see if the chest contains the item
      for(var i = 0; i < chest.items.length; i++) {
        var item = chest.items[i];

        if(info.Id == item.id) {
          return true;
        }
      }
    }
  }

  return false;
}

function findBlock(direction) {
  if(!world)
    return;

  var x = selectionX;
  var y = selectionY + direction;

  var start = x * world.height + y;

  var selectedInfos = getSelectedInfos();

  if(selectedInfos.length > 0) {
    for(var i = start; i >= 0 && i < world.tiles.length; i += direction) {
      var tile = world.tiles[i];

      var foundMatch = false;

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

function highlightAll() {
  if(!world)
    return;

  var selectedInfos = getSelectedInfos();

  highlightInfos(selectedInfos);
}

function highlightInfos(selectedInfos) {
  var x = 0;
  var y = 0;

  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  overlayCtx.fillStyle = "rgba(0, 0, 0, 0.75)";
  overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if(selectedInfos.length > 0) {
    for(var i = 0; i < world.tiles.length; i++) {
      var tile = world.tiles[i];

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

function getSelectedInfos() {
  var selectedInfos = [];

  var j;
  var option;

  for(j = 0; j < blockSelector.options.length; j++) {
    option = blockSelector.options[j];
    if(!option.selected)
      continue;

    var tileInfo = getTileInfoFromOption(option);

    if(tileInfo) {
      selectedInfos.push(tileInfo);
    }
    else {
      var itemInfo = getItemInfoFromOption(option);
      if(itemInfo) {
        selectedInfos.push(itemInfo);
      }
      else {
        var wallInfo = getWallInfoFromOption(option);
        if(wallInfo) {
          selectedInfos.push(wallInfo);
        }
      }
    }
  }

  return selectedInfos;
}

function getTileInfoFromOption(option) {
  var tileInfo = getTileInfoFrom(option.value, option.getAttribute("data-u"), option.getAttribute("data-v"));

  return tileInfo;
}

function getTileInfoFrom(id, u, v) {
  var tileInfo = settings.Tiles[id];

  if(tileInfo && tileInfo.Frames) {
    for(var frameIndex = 0; frameIndex < tileInfo.Frames.length; frameIndex++) {
      var frame = tileInfo.Frames[frameIndex];

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

function getItemInfoFromOption(option) {
  for(var i = 0; i < settings.Items.length; i++) {
    var item = settings.Items[i];

    if(option.value == `item${item.Id}`) {
      return item;
    }
  }

  return null;
}

function getWallInfoFromOption(option) {
  for(var i = 0; i < settings.Walls.length; i++) {
    var wall = settings.Walls[i];

    if(option.value == `wall${wall.Id}`) {
      return wall;
    }
  }

  return null;
}

function getTileInfo(tile) {
  var tileInfo = settings.Tiles[tile.Type];

  if(!tileInfo) return tileInfo;

  if(!tileInfo.Frames)
    return tileInfo;

  var matchingFrame;

  for(var i = 0; i < tileInfo.Frames.length; i++) {
    var frame = tileInfo.Frames[i];

    if((!frame.U && !tile.TextureU) || frame.U <= tile.TextureU) {
      if((!frame.V && !tile.TextureV) || frame.V <= tile.TextureV)
        matchingFrame = frame;
    }
  }

  if(!matchingFrame)
    return tileInfo;

  matchingFrame.parent = tileInfo;

  return matchingFrame;
}

function clearHighlight() {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
}

function clearSelection() {
  selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
}

function resetPanZoom(e) {
  panzoom.panzoom('reset');
}

function resizeCanvases() {
  var width = window.innerWidth * 0.99;

  var ratio = panzoomContainer.height/panzoomContainer.width;
  var height = width * ratio;

  panzoomContainer.style.width = width+'px';
  panzoomContainer.style.height = height+'px';
  canvas.style.width = width+'px';
  overlayCanvas.style.width = width+'px';
  selectionCanvas.style.width = width + 'px';
  $('#canvasContainer').css("overflow", "visible");
}

function getMousePos(canvas, evt) {
  var rect = panzoomContainer.getBoundingClientRect();
  var transform = $(panzoomContainer).panzoom('getMatrix');

  var scale = transform[0];

  scale = rect.width / panzoomContainer.width;

  var mousePos =  {
    x: Math.floor((evt.clientX - rect.left) / scale),
    y: Math.floor((evt.clientY - rect.top) / scale)
  };

  // console.log(`${evt.clientX}\t${evt.clientY}\t${rect.left}\t${rect.top}\t${scale}\t${mousePos.x}\t${mousePos.y}`);

  return mousePos;
}

panzoomContainer.addEventListener('mousemove', evt => {
  if(!world)
    return;

  var mousePos = getMousePos(panzoomContainer, evt);
  var x = mousePos.x;
  var y = mousePos.y;

  $("#status").html(mousePos.x + ',' + (mousePos.y));

  if(world.tiles) {
    var tile = getTileAt(mousePos.x, mousePos.y);

    if(tile) {
      var text = getTileText(tile);

      $("#status").html(`${text} (${mousePos.x}, ${mousePos.y})`);
    }
  }
});

$("#panzoomContainer").on('panzoomend', function(evt, panzoom, matrix, changed) {
  if (changed) return;
    
  var mousePos = getMousePos(panzoomContainer, evt);
  var x = mousePos.x;
  var y = mousePos.y;

  selectionX = x;
  selectionY = y;

  drawSelectionIndicator();

  var tile = getTileAt(x, y);
  if(tile) {
    var text = getTileText(tile);

    $("#tileInfoList").html("");

    var chest = tile.chest;
    if(chest) {
      if(chest.name.length > 0)
      text = `${text} - ${chest.name}`;

      for(var i = 0; i < chest.items.length; i++) {
        var item = chest.items[i];
        var prefix = "";

        if(item.prefixId > 0 && item.prefixId < settings.ItemPrefix.length)
          prefix = settings.ItemPrefix[item.prefixId].Name;

        var itemName = item.id;
        for(var itemIndex = 0; itemIndex < settings.Items.length; itemIndex++) {
          var itemSettings = settings.Items[itemIndex];
          if(itemSettings.Id == item.id) {
            itemName = itemSettings.Name;
            break;
          }
        }


        $("#tileInfoList").append(`<li>${prefix} ${itemName} (${item.count})</li>`);
      }
    }

    var sign = tile.sign;
    if(sign && sign.text) {
      if(sign.text.length > 0)
        $("#tileInfoList").append(`<li>${sign.text}</li>`);
    }

    $("#tile").html(text);
  }

});

function getTileAt(x, y) {
  if(!world) return;

  var index = x * world.height + y;
  if(index >= 0 && index < world.tiles.length) {
    return world.tiles[index];
  }

  return null;
}

function selectPoint(x, y) {
  selectionX = x;
  selectionY = y;
  drawSelectionIndicator();
}

function drawSelectionIndicator() {
  var x = selectionX + 0.5;
  var y = selectionY + 0.5;

  var lineWidth = 12;
  var targetWidth = 39;
  var halfTargetWidth = targetWidth / 2;

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

function getTileText (tile) {
  var text = "Nothing";

  if(!tile) {
    return text;
  }

  var tileInfo = tile.info;

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
  }
  else if (tile.IsLiquidPresent) {
    text = "Water";

    if(tile.IsLiquidLava) {
      text = "Lava";
    }
    else if (tile.IsLiquidHoney) {
      text = "Honey";
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

function fileNameChanged (evt) {
  file = evt.target.files[0];

  $("#help").hide();

  reloadWorld();
}

function reloadWorld() {
  var worker = new Worker('resources/js/WorldLoader.js');
  worker.addEventListener('message', onWorldLoaderWorkerMessage);

  worker.postMessage(file);
}

function onWorldLoaderWorkerMessage(e) {
  if(e.data.status)
    $("#status").html(e.data.status);

  if(e.data.tiles) {
	  let xlimit = e.data.x + e.data.tiles.length / world.height;
	  let i = 0;
	  for(let x = e.data.x; x < xlimit; x++) {
	    for(let y = 0; y < world.height; y++) {
	      let tile = e.data.tiles[i++];
	      if(tile) {
	        tile.info = getTileInfo(tile);
	        world.tiles.push(tile);

	        var c = getTileColor(y, tile, world);
	        if(!c) c = {"r": 0, "g": 0, "b": 0 };

	        ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
	        ctx.fillRect(x, y, 1, 1);
	      }
	    }
		}
  }

  if(e.data.chests) {
    world.chests = e.data.chests;

    for(i = 0; i < e.data.chests.length; i++) {
      var chest = e.data.chests[i];

      var idx = chest.x * world.height + chest.y;
      world.tiles[idx].chest = chest;
      world.tiles[idx + 1].chest = chest;

      idx = (chest.x + 1) * world.height + chest.y;
      world.tiles[idx].chest = chest;
      world.tiles[idx + 1].chest = chest;
    }
  }

  if(e.data.signs) {
    world.signs = e.data.signs;

    for(i = 0; i < e.data.signs.length; i++) {
      var sign = e.data.signs[i];

      var tileIndex = sign.x * world.height + sign.y;
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

    Object.keys(world).filter(key => {
      const value = world[key];
      const type = typeof value;
      return type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint';
    }).sort()
    .forEach(key => 
      $("#worldPropertyList").append(`<li>${key}: ${world[key]}</li>`)
    );
  }
}

function addNpcs(npcs) {
  world.npcs = npcs;

  for(var i = 0; i < npcs.length; i++) {
    var npc = npcs[i];

    var npcText = npc.name;
    if(npc.type != npc.name) {
      npcText = `${npcText} the ${npc.type}`;
    }

    $("#npcList").append(`<li><a href="#" onclick="selectPoint(${npc.x}, ${npc.y})">${npcText}</a></li>`);
  }
}

function getTileColor(y, tile, world) {
  if(tile.IsActive) {
    return tileColors[tile.Type][0];
  }

  if (tile.IsLiquidPresent) {
    if(tile.IsLiquidLava)
      return liquidColors[1];
    else if (tile.IsLiquidHoney)
      return liquidColors[2];
    else
      return liquidColors[0];
  }

  if (tile.IsWallPresent) {
    return wallColors[tile.WallType][0];
  }


  if(y < world.worldSurfaceY)
    return { "r": 132, "g": 170, "b": 248 };

  if(y < world.rockLayerY)
    return { "r": 88, "g": 61, "b": 46 };

  if(y < world.hellLayerY)
    return { "r": 74, "g": 67, "b": 60 };

  return { "r": 0, "g": 0, "b": 0 };
}

function saveMapImage() {
  var newCanvas = document.createElement("canvas");
  var newContext = newCanvas.getContext("2d");

  newCanvas.height = world.height;
  newCanvas.width = world.width;

  newContext.drawImage(canvas, 0, 0);
  newContext.drawImage(overlayCanvas, 0, 0);
  newContext.drawImage(selectionCanvas, 0, 0);

  newCanvas.toBlob(function(blob) {
    saveAs(blob, `${world.name}.png`);
  });
}
