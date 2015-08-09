var canvasContainer = document.querySelector("#canvasContainer");
var panzoomContainer = document.querySelector("#panzoomContainer");

var canvas = document.querySelector("#canvas");
var overlayCanvas = document.querySelector("#overlayCanvas");
var selectionCanvas = document.querySelector("#selectionCanvas");

var ctx = canvas.getContext("2d");
var overlayCtx = overlayCanvas.getContext("2d");
var selectionCtx = selectionCanvas.getContext("2d");

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
          option.text += " - " + frame.Name;
        }

        if(frame.Variety) {
          option.text += " - " + frame.Variety;
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
    option.text = item.Name + " (Item)";
    option.value = "item" + item.Id;
    options.push(option);
  }
}

function addWallSelectOptions() {
  for(var i = 0; i < settings.Walls.length; i++) {
    var wall = settings.Walls[i];

    wall.isWall = true;

    var option = document.createElement("option");
    option.text = wall.Name + " (Wall)";
    option.value = "wall" + wall.Id;
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

//   canvasContainer.height = window.innerHeight;
//   $('#canvasContainer').css("height", window.innerHeight + "px");
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

    if(option.value == "item" + item.Id) {
      return item;
    }
  }

  return null;
}

function getWallInfoFromOption(option) {
  for(var i = 0; i < settings.Walls.length; i++) {
    var wall = settings.Walls[i];

    if(option.value == "wall" + wall.Id) {
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

//   canvasContainer.height = window.innerHeight;
//   $('#canvasContainer').css("height", window.innerHeight + "px");
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

  // console.log(evt.clientX + "\t" + evt.clientY + "\t" + rect.left + "\t" + rect.top + "\t" + scale + "\t" + mousePos.x + "\t" + mousePos.y);

  return mousePos;
}

var leftButtonDown = false;
var leftButtonDragged = false;

panzoomContainer.addEventListener('mousedown', function(evt) {
  if(evt.which === 1) {
    leftButtonDown = true;
  }
}, false);

panzoomContainer.addEventListener('mousemove', function(evt) {
  if(evt.which === 1 && leftButtonDown) {
      leftButtonDragged = true;
  }
    
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
      
      $("#status").html(text + " (" + mousePos.x + ", " + mousePos.y + ")");
    }
  }
}, false);

panzoomContainer.addEventListener('mouseup', function(evt) {  
  if(evt.which != 1) return;

  leftButtonDown = false;

  if(leftButtonDragged) {
    leftButtonDragged = false;
    return;
  }

  leftButtonDragged = false;
  
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
      text = text + " - " + chest.name;

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


        $("#tileInfoList").append('<li>' + prefix + ' ' + itemName + ' (' + item.count +')</li>');
      } 
    }
     
    var sign = tile.sign;
    if(sign && sign.text) {
      if(sign.text.length > 0)
        $("#tileInfoList").append('<li>' + sign.text +'</li>');
    }
       
    $("#tile").html(text);  
  }  
  
}, false);

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
        text += " - " + tileInfo.Name;

        if(tileInfo.Variety)
          text += " - " + tileInfo.Variety;
      }
      else if (tileInfo.Variety) {
        text += " - " + tileInfo.Variety;
      }
    }

    if(tile.TextureU > 0 && tile.TextureV > 0)
      text += " (" + tile.Type + ", " + tile.TextureU + ", " + tile.TextureV + ")";
    else if(tile.TextureU > 0)
      text += " (" + tile.Type + ", " + tile.TextureU + ")";
    else
      text += " (" + tile.Type + ")";
  }
  else if (tile.WallType || tile.WallType === 0) {
    if(tile.WallType < settings.Walls.length) {
      text = settings.Walls[tile.WallType].Name + " (" + tile.WallType + ")";
    }
    else {
      text = "Unknown Wall (" + tile.WallType + ")";
    }
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

  if(tile.IsRedWirePresent)
    text += " (Red Wire)";

  if(tile.IsGreenWirePresent)
    text += " (Green Wire)";

  if(tile.IsBlueWirePresent)
    text += " (Blue Wire)";
    
  return text;
}

function fileNameChanged (evt) {
  var worker = new Worker('WorldLoader.js');
  worker.addEventListener('message', onWorldLoaderWorkerMessage);
  
  worker.postMessage(evt.target.files[0]);
}

function onWorldLoaderWorkerMessage(e) {
  if(e.data.status)
    $("#status").html(e.data.status);
    
  var x = 0;
  var i = 0;
  var tile;
  
  if(e.data.tiles) {
    x = e.data.x;
    
    for(i = 0; i < e.data.tiles.length; i++) {
      tile = e.data.tiles[i];
      
      if(tile) {
        tile.info = getTileInfo(tile);
        world.tiles.push(tile);
        
        ctx.fillStyle = getTileColor(i, tile, world);
        ctx.fillRect(x, i, 1, 1);
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

      var idx = sign.x * world.height + sign.y;
      world.tiles[idx].sign = sign;
      world.tiles[idx + 1].sign = sign;

      idx = (sign.x + 1) * world.height + sign.y;
      world.tiles[idx].sign = sign;
      world.tiles[idx + 1].sign = sign;
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
    
    $("#worldPropertyList").append('<li>Version: ' + world.version + '</li>');
    $("#worldPropertyList").append('<li>Name: ' + world.name + '</li>');
    $("#worldPropertyList").append('<li>Id: ' + world.id + '</li>');
    $("#worldPropertyList").append('<li>Width: ' + world.width + '</li>');
    $("#worldPropertyList").append('<li>Height: ' + world.height + '</li>');
    $("#worldPropertyList").append('<li>expertMode: ' + world.expertMode + '</li>');
    $("#worldPropertyList").append('<li>moonType: ' + world.moonType + '</li>');
    $("#worldPropertyList").append('<li>spawnX: ' + world.spawnX + '</li>');
    $("#worldPropertyList").append('<li>spawnY: ' + world.spawnY + '</li>');
    $("#worldPropertyList").append('<li>SurfaceY: ' + world.worldSurfaceY + '</li>');
    $("#worldPropertyList").append('<li>rockLayerY: ' + world.rockLayerY + '</li>');
    $("#worldPropertyList").append('<li>gameTime: ' + world.gameTime + '</li>');
    $("#worldPropertyList").append('<li>isDay: ' + world.isDay + '</li>');
    $("#worldPropertyList").append('<li>moonPhase: ' + world.moonPhase + '</li>');
    $("#worldPropertyList").append('<li>bloodMoon: ' + world.bloodMoon + '</li>');
    $("#worldPropertyList").append('<li>eclipse: ' + world.eclipse + '</li>');
    $("#worldPropertyList").append('<li>dungeonX: ' + world.dungeonX + '</li>');
    $("#worldPropertyList").append('<li>dungeonY: ' + world.dungeonY + '</li>');
    $("#worldPropertyList").append('<li>crimsonWorld: ' + world.crimsonWorld + '</li>');
    $("#worldPropertyList").append('<li>killedEyeOfCthulu: ' + world.killedEyeOfCthulu + '</li>');
    $("#worldPropertyList").append('<li>killedEaterOfWorlds: ' + world.killedEaterOfWorlds + '</li>');
    $("#worldPropertyList").append('<li>killedSkeletron: ' + world.killedSkeletron + '</li>');
    $("#worldPropertyList").append('<li>killedQueenBee: ' + world.killedQueenBee + '</li>');
    $("#worldPropertyList").append('<li>killedTheDestroyer: ' + world.killedTheDestroyer + '</li>');
    $("#worldPropertyList").append('<li>killedTheTwins: ' + world.killedTheTwins + '</li>');
    $("#worldPropertyList").append('<li>killedSkeletronPrime: ' + world.killedSkeletronPrime + '</li>');
    $("#worldPropertyList").append('<li>killedAnyHardmodeBoss: ' + world.killedAnyHardmodeBoss + '</li>');
    $("#worldPropertyList").append('<li>killedPlantera: ' + world.killedPlantera + '</li>');
    $("#worldPropertyList").append('<li>killedGolem: ' + world.killedGolem + '</li>');
    $("#worldPropertyList").append('<li>killedSlimeKing: ' + world.killedSlimeKing + '</li>');
    $("#worldPropertyList").append('<li>savedGoblinTinkerer: ' + world.savedGoblinTinkerer + '</li>');
    $("#worldPropertyList").append('<li>savedWizard: ' + world.savedWizard + '</li>');
    $("#worldPropertyList").append('<li>savedMechanic: ' + world.savedMechanic + '</li>');
    $("#worldPropertyList").append('<li>defeatedGoblinInvasion: ' + world.defeatedGoblinInvasion + '</li>');
    $("#worldPropertyList").append('<li>killedClown: ' + world.killedClown + '</li>');
    $("#worldPropertyList").append('<li>defeatedFrostLegion: ' + world.defeatedFrostLegion + '</li>');
    $("#worldPropertyList").append('<li>defeatedPirates: ' + world.defeatedPirates + '</li>');
    $("#worldPropertyList").append('<li>brokeAShadowOrb: ' + world.brokeAShadowOrb + '</li>');
    $("#worldPropertyList").append('<li>meteorSpawned: ' + world.meteorSpawned + '</li>');
    $("#worldPropertyList").append('<li>shadowOrbsbrokenmod3: ' + world.shadowOrbsbrokenmod3 + '</li>');
    $("#worldPropertyList").append('<li>altarsSmashed: ' + world.altarsSmashed + '</li>');
    $("#worldPropertyList").append('<li>hardMode: ' + world.hardMode + '</li>');
    $("#worldPropertyList").append('<li>goblinInvasionDelay: ' + world.goblinInvasionDelay + '</li>');
    $("#worldPropertyList").append('<li>goblinInvasionSize: ' + world.goblinInvasionSize + '</li>');
    $("#worldPropertyList").append('<li>goblinInvasionType: ' + world.goblinInvasionType + '</li>');
    $("#worldPropertyList").append('<li>goblinInvasionX: ' + world.goblinInvasionX + '</li>');
    $("#worldPropertyList").append('<li>slimeRainTime: ' + world.slimeRainTime + '</li>');
    $("#worldPropertyList").append('<li>sundialCooldown: ' + world.sundialCooldown + '</li>');
    $("#worldPropertyList").append('<li>isRaining: ' + world.isRaining + '</li>');
    $("#worldPropertyList").append('<li>rainTime: ' + world.rainTime + '</li>');
    $("#worldPropertyList").append('<li>maxRain: ' + world.maxRain + '</li>');
    $("#worldPropertyList").append('<li>tier1OreID: ' + world.tier1OreID + '</li>');
    $("#worldPropertyList").append('<li>tier2OreID: ' + world.tier2OreID + '</li>');
    $("#worldPropertyList").append('<li>tier3OreID: ' + world.tier3OreID + '</li>');
    $("#worldPropertyList").append('<li>treeStyle: ' + world.treeStyle + '</li>');
    $("#worldPropertyList").append('<li>corruptionStyle: ' + world.corruptionStyle + '</li>');
    $("#worldPropertyList").append('<li>jungleStyle: ' + world.jungleStyle + '</li>');
    $("#worldPropertyList").append('<li>snowStyle: ' + world.snowStyle + '</li>');
    $("#worldPropertyList").append('<li>hallowStyle: ' + world.hallowStyle + '</li>');
    $("#worldPropertyList").append('<li>crimsonStyle: ' + world.crimsonStyle + '</li>');
    $("#worldPropertyList").append('<li>desertStyle: ' + world.desertStyle + '</li>');
    $("#worldPropertyList").append('<li>oceanStyle: ' + world.oceanStyle + '</li>');
    $("#worldPropertyList").append('<li>cloudBackground: ' + world.cloudBackground + '</li>');
    $("#worldPropertyList").append('<li>numberofClouds: ' + world.numberofClouds + '</li>');
    $("#worldPropertyList").append('<li>windSpeed: ' + world.windSpeed + '</li>');
    $("#worldPropertyList").append('<li>savedAngler: ' + world.savedAngler + '</li>');
    $("#worldPropertyList").append('<li>anglerQuest: ' + world.anglerQuest + '</li>');
    $("#worldPropertyList").append('<li>savedStylist: ' + world.savedStylist + '</li>');
    $("#worldPropertyList").append('<li>savedTaxCollector: ' + world.savedTaxCollector + '</li>');
    $("#worldPropertyList").append('<li>invasionSizeStart: ' + world.invasionSizeStart + '</li>');
    $("#worldPropertyList").append('<li>tempCultistDelay: ' + world.tempCultistDelay + '</li>');
    $("#worldPropertyList").append('<li>fastForwardTime: ' + world.fastForwardTime + '</li>');
    $("#worldPropertyList").append('<li>downedFishron: ' + world.downedFishron + '</li>');
    $("#worldPropertyList").append('<li>downedMartians: ' + world.downedMartians + '</li>');
    $("#worldPropertyList").append('<li>downedAncientCultist: ' + world.downedAncientCultist + '</li>');
    $("#worldPropertyList").append('<li>downedMoonlord: ' + world.downedMoonlord + '</li>');
    $("#worldPropertyList").append('<li>downedHalloweenKing: ' + world.downedHalloweenKing + '</li>');
    $("#worldPropertyList").append('<li>downedHalloweenTree: ' + world.downedHalloweenTree + '</li>');
    $("#worldPropertyList").append('<li>downedChristmasIceQueen: ' + world.downedChristmasIceQueen + '</li>');
    $("#worldPropertyList").append('<li>downedChristmasSantank: ' + world.downedChristmasSantank + '</li>');
    $("#worldPropertyList").append('<li>downedChristmasTree: ' + world.downedChristmasTree + '</li>');
    $("#worldPropertyList").append('<li>downedTowerSolar: ' + world.downedTowerSolar + '</li>');
    $("#worldPropertyList").append('<li>downedTowerVortex: ' + world.downedTowerVortex + '</li>');
    $("#worldPropertyList").append('<li>downedTowerNebula: ' + world.downedTowerNebula + '</li>');
    $("#worldPropertyList").append('<li>downedTowerStardust: ' + world.downedTowerStardust + '</li>');
    $("#worldPropertyList").append('<li>towerActiveSolar: ' + world.towerActiveSolar + '</li>');
    $("#worldPropertyList").append('<li>towerActiveVortex: ' + world.towerActiveVortex + '</li>');
    $("#worldPropertyList").append('<li>towerActiveNebula: ' + world.towerActiveNebula + '</li>');
    $("#worldPropertyList").append('<li>towerActiveStardust: ' + world.towerActiveStardust + '</li>');
    $("#worldPropertyList").append('<li>lunarApocalypseIsUp: ' + world.lunarApocalypseIsUp + '</li>');
  }
}

function addNpcs(npcs) {
  world.npcs = npcs;
  
  for(var i = 0; i < npcs.length; i++) {
    var npc = npcs[i];
    
    $("#npcList").append('<li><a href="#" onclick="selectPoint(' + npc.x + ', ' + npc.y + ')">' + npc.name + ' the ' + npc.type + '</a></li>');
  }
}

function getTileColor(y, tile, world) {
  if(tile.IsActive) {
    return tileColors[tile.Type][0];
  }
  
  if (tile.IsWallPresent) {
    return wallColors[tile.WallType][0];
  }
  
  if (tile.IsLiquidPresent) {
    if(tile.IsLiquidLava)
      return liquidColors[1];
    else if (tile.IsLiquidHoney)
      return liquidColors[2];
    else
      return liquidColors[0];
  }
  
  if(y < world.worldSurfaceY)
    return '#84AAF8';
  
  if(y < world.rockLayerY)
    return '#583D2E';
    
  if(y < world.hellLayerY)
    return '#4A433C';
  
  return '#000000';
}

function saveMapImage() {
  var newCanvas = document.createElement("canvas");
  var newContext = newCanvas.getContext("2d");
  
  newCanvas.height = world.height;
  newCanvas.width = world.width;
  
  newContext.drawImage(canvas, 0, 0);
  newContext.drawImage(overlayCanvas, 0, 0);
  newContext.drawImage(selectionCanvas, 0, 0)
  
  newCanvas.toBlob(function(blob) {
    saveAs(blob, world.name + ".png");
  });
}