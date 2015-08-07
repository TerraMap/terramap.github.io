var canvasContainer = document.querySelector("#canvasContainer");
var panzoomContainer = document.querySelector("#panzoomContainer");

var canvas = document.querySelector("#canvas");
var overlayCanvas = document.querySelector("#overlayCanvas");

var ctx = canvas.getContext("2d");
var overlayCtx = overlayCanvas.getContext("2d");

var blockSelector = document.querySelector("#blocks");

ctx.msImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
// ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
	
overlayCtx.msImageSmoothingEnabled = false;
overlayCtx.mozImageSmoothingEnabled = false;
// overlayCtx.webkitImageSmoothingEnabled = false;
overlayCtx.msImageSmoothingEnabled = false;
overlayCtx.imageSmoothingEnabled = false;

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

var idx = 0;

for(idx = 0; idx < settings.Tiles.length; idx++) {
  var tile = settings.Tiles[idx];

  tile.isTile = true;

  var option = document.createElement("option");
  option.text = tile.Name;
  option.value = idx;
  options.push(option);

  if(tile.Frames) {
    for(var frameIndex = 0; frameIndex < tile.Frames.length; frameIndex++) {
      var frame = tile.Frames[frameIndex];

      option = document.createElement("option");
      option.text = tile.Name;
      option.value = idx;

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

for(idx = 0; idx < settings.Items.length; idx++) {
  var item = settings.Items[idx];

  item.isItem = true;

  var option = document.createElement("option");
  option.text = item.Name + " (Item)";
  option.value = "item" + item.Id;
  options.push(option);
}

for(idx = 0; idx < settings.Walls.length; idx++) {
  var wall = settings.Walls[idx];

  wall.isWall = true;

  var option = document.createElement("option");
  option.text = wall.Name + " (Wall)";
  option.value = "wall" + wall.Id;
  options.push(option);
}

options.sort(compareOptions);

for(var idx = 0; idx < options.length; idx++) {
  var option = options[idx];
  
  blockSelector.add(option);
}

function compareOptions(a,b) {
  if (a.text < b.text)
    return -1;
  if (a.text > b.text)
    return 1;
  return 0;
}

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
    var chest = tile.chest; // getChestAt(x, y);
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
    
  var x = 0;
  var y = 0;
  
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  overlayCtx.fillStyle = "rgba(0, 0, 0, 0.75)";
  overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  
  var selectedInfos = getSelectedInfos();
  
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
  
  $("#canvas").css("z-index", "0");
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
  var tileInfo = settings.Tiles[option.value];
  
  if(tileInfo && tileInfo.Frames) {
    for(var frameIndex = 0; frameIndex < tileInfo.Frames.length; frameIndex++) {
      var frame = tileInfo.Frames[frameIndex];

      if(option.getAttribute("data-u") != frame.U)
        continue;
      
      if(option.getAttribute("data-v") != frame.V)
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
  $("#canvas").css("z-index", "2");
}

function resetPanZoom(e) {
  panzoom.panzoom('reset');  
}

function resizeCanvases() {
  var width = window.innerWidth * 0.99;
  
  canvasContainer.height = window.innerHeight;
  
  var ratio = panzoomContainer.height/panzoomContainer.width;
  var height = width * ratio;
  
  panzoomContainer.style.width = width+'px';
  panzoomContainer.style.height = height+'px';
  canvas.style.width = width+'px';
  overlayCanvas.style.width = width+'px';
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
  
  $("#position").html(mousePos.x + ',' + (mousePos.y));
  
  if(world.tiles) {
    var tile = getTileAt(mousePos.x, mousePos.y);
    
    if(tile) {
      var text = getTileText(tile);
      
      $("#tile").html(text);
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
    var tbody = $("#tableSelectedTile").find('tbody');
    tbody.html("");
    
    var text = getTileText(tile);
    
    var chest = tile.chest; // getChestAt(x, y);
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

        tbody.append($('<tr>')
          .append($('<td>').text(prefix + " " + itemName))
          .append($('<td>').text(item.count))
        );
      } 
    }
        
    $("#selectedTileName").html(text);  
  }  
  
}, false);

// function getChestAt(x, y) {
//   var chest;

//   for(var chestIndex = 0; chestIndex < world.chests.length; chestIndex++) {
//     chest = world.chests[chestIndex];
//     if(chest && (chest.x == x || chest.x + 1 == x) && (chest.y == y || chest.y + 1 == y)) {
//       break;
//     }
//   }

//   return chest;
// }

function getTileAt(x, y) {
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

  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  overlayCtx.lineWidth = lineWidth;
  overlayCtx.strokeStyle="rgb(255, 0, 0)";
  overlayCtx.strokeRect(x - halfTargetWidth, y - halfTargetWidth, targetWidth, targetWidth);

  // draw cross-hairs
  overlayCtx.lineWidth=1;
  overlayCtx.beginPath();
  overlayCtx.moveTo(x - halfTargetWidth, y);
  overlayCtx.lineTo(x - 1, y);
  overlayCtx.stroke();
  overlayCtx.beginPath();
  overlayCtx.moveTo(x + halfTargetWidth, y);
  overlayCtx.lineTo(x + 1, y);
  overlayCtx.stroke();
  overlayCtx.beginPath();
  overlayCtx.moveTo(x, y - halfTargetWidth);
  overlayCtx.lineTo(x, y - 1);
  overlayCtx.stroke();
  overlayCtx.beginPath();
  overlayCtx.moveTo(x, y + halfTargetWidth);
  overlayCtx.lineTo(x, y + 1);
  overlayCtx.stroke();
  
  $("#canvas").css("z-index", "0");
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
  }
  
  if(e.data.npcs) {
    addNpcs(e.data.npcs);
    
    $("#accordionNpcs").css("display", "block");
  }
  
  if(e.data.world) {
    world = e.data.world;
  
    panzoomContainer.width = world.width;
    panzoomContainer.height = world.height;
    canvas.width = world.width;
    canvas.height = world.height;
    overlayCanvas.width = world.width;
    overlayCanvas.height = world.height;
    
    world.tiles = [];
    
    resizeCanvases();
    
    $("#accordionWorldProperties").css("display", "block");
    $("#accordionSelectedTile").css("display", "block");

    document.querySelector("#worldVersion").innerText = world.version;
    document.querySelector("#worldName").innerText = world.name;
    document.querySelector("#worldId").innerText = world.id;
    document.querySelector("#worldWidth").innerText = world.width;
    document.querySelector("#worldHeight").innerText = world.height;
    document.querySelector("#expertMode").innerText = world.expertMode;
    document.querySelector("#moonType").innerText = world.moonType;
    document.querySelector("#spawnX").innerText = world.spawnX;
    document.querySelector("#spawnY").innerText = world.spawnY;
    document.querySelector("#worldSurfaceY").innerText = world.worldSurfaceY;
    document.querySelector("#rockLayerY").innerText = world.rockLayerY;
    document.querySelector("#gameTime").innerText = world.gameTime;
    document.querySelector("#isDay").innerText = world.isDay;
    document.querySelector("#moonPhase").innerText = world.moonPhase;
    document.querySelector("#bloodMoon").innerText = world.bloodMoon;
    document.querySelector("#eclipse").innerText = world.eclipse;
    document.querySelector("#dungeonX").innerText = world.dungeonX;
    document.querySelector("#dungeonY").innerText = world.dungeonY;
    document.querySelector("#crimsonWorld").innerText = world.crimsonWorld;
    document.querySelector("#killedEyeOfCthulu").innerText = world.killedEyeOfCthulu;
    document.querySelector("#killedEaterOfWorlds").innerText = world.killedEaterOfWorlds;
    document.querySelector("#killedSkeletron").innerText = world.killedSkeletron;
    document.querySelector("#killedQueenBee").innerText = world.killedQueenBee;
    document.querySelector("#killedTheDestroyer").innerText = world.killedTheDestroyer;
    document.querySelector("#killedTheTwins").innerText = world.killedTheTwins;
    document.querySelector("#killedSkeletronPrime").innerText = world.killedSkeletronPrime;
    document.querySelector("#killedAnyHardmodeBoss").innerText = world.killedAnyHardmodeBoss;
    document.querySelector("#killedPlantera").innerText = world.killedPlantera;
    document.querySelector("#killedGolem").innerText = world.killedGolem;
    document.querySelector("#killedSlimeKing").innerText = world.killedSlimeKing;
    document.querySelector("#savedGoblinTinkerer").innerText = world.savedGoblinTinkerer;
    document.querySelector("#savedWizard").innerText = world.savedWizard;
    document.querySelector("#savedMechanic").innerText = world.savedMechanic;
    document.querySelector("#defeatedGoblinInvasion").innerText = world.defeatedGoblinInvasion;
    document.querySelector("#killedClown").innerText = world.killedClown;
    document.querySelector("#defeatedFrostLegion").innerText = world.defeatedFrostLegion;
    document.querySelector("#defeatedPirates").innerText = world.defeatedPirates;
    document.querySelector("#brokeAShadowOrb").innerText = world.brokeAShadowOrb;
    document.querySelector("#meteorSpawned").innerText = world.meteorSpawned;
    document.querySelector("#shadowOrbsbrokenmod3").innerText = world.shadowOrbsbrokenmod3;
    document.querySelector("#altarsSmashed").innerText = world.altarsSmashed;
    document.querySelector("#hardMode").innerText = world.hardMode;
    document.querySelector("#goblinInvasionDelay").innerText = world.goblinInvasionDelay;
    document.querySelector("#goblinInvasionSize").innerText = world.goblinInvasionSize;
    document.querySelector("#goblinInvasionType").innerText = world.goblinInvasionType;
    document.querySelector("#goblinInvasionX").innerText = world.goblinInvasionX;
    document.querySelector("#slimeRainTime").innerText = world.slimeRainTime;
    document.querySelector("#sundialCooldown").innerText = world.sundialCooldown;
    document.querySelector("#isRaining").innerText = world.isRaining;
    document.querySelector("#rainTime").innerText = world.rainTime;
    document.querySelector("#maxRain").innerText = world.maxRain;
    document.querySelector("#tier1OreID").innerText = world.tier1OreID;
    document.querySelector("#tier2OreID").innerText = world.tier2OreID;
    document.querySelector("#tier3OreID").innerText = world.tier3OreID;
    document.querySelector("#treeStyle").innerText = world.treeStyle;
    document.querySelector("#corruptionStyle").innerText = world.corruptionStyle;
    document.querySelector("#jungleStyle").innerText = world.jungleStyle;
    document.querySelector("#snowStyle").innerText = world.snowStyle;
    document.querySelector("#hallowStyle").innerText = world.hallowStyle;
    document.querySelector("#crimsonStyle").innerText = world.crimsonStyle;
    document.querySelector("#desertStyle").innerText = world.desertStyle;
    document.querySelector("#oceanStyle").innerText = world.oceanStyle;
    document.querySelector("#cloudBackground").innerText = world.cloudBackground;
    document.querySelector("#numberofClouds").innerText = world.numberofClouds;
    document.querySelector("#windSpeed").innerText = world.windSpeed;
    document.querySelector("#savedAngler").innerText = world.savedAngler;
    document.querySelector("#anglerQuest").innerText = world.anglerQuest;
    document.querySelector("#savedStylist").innerText = world.savedStylist;
    document.querySelector("#savedTaxCollector").innerText = world.savedTaxCollector;
    document.querySelector("#invasionSizeStart").innerText = world.invasionSizeStart;
    document.querySelector("#tempCultistDelay").innerText = world.tempCultistDelay;
    document.querySelector("#fastForwardTime").innerText = world.fastForwardTime;
    document.querySelector("#downedFishron").innerText = world.downedFishron;
    document.querySelector("#downedMartians").innerText = world.downedMartians;
    document.querySelector("#downedAncientCultist").innerText = world.downedAncientCultist;
    document.querySelector("#downedMoonlord").innerText = world.downedMoonlord;
    document.querySelector("#downedHalloweenKing").innerText = world.downedHalloweenKing;
    document.querySelector("#downedHalloweenTree").innerText = world.downedHalloweenTree;
    document.querySelector("#downedChristmasIceQueen").innerText = world.downedChristmasIceQueen;
    document.querySelector("#downedChristmasSantank").innerText = world.downedChristmasSantank;
    document.querySelector("#downedChristmasTree").innerText = world.downedChristmasTree;
    document.querySelector("#downedTowerSolar").innerText = world.downedTowerSolar;
    document.querySelector("#downedTowerVortex").innerText = world.downedTowerVortex;
    document.querySelector("#downedTowerNebula").innerText = world.downedTowerNebula;
    document.querySelector("#downedTowerStardust").innerText = world.downedTowerStardust;
    document.querySelector("#towerActiveSolar").innerText = world.towerActiveSolar;
    document.querySelector("#towerActiveVortex").innerText = world.towerActiveVortex;
    document.querySelector("#towerActiveNebula").innerText = world.towerActiveNebula;
    document.querySelector("#towerActiveStardust").innerText = world.towerActiveStardust;
    document.querySelector("#lunarApocalypseIsUp").innerText = world.lunarApocalypseIsUp;
  }
}

function addNpcs(npcs) {
  world.npcs = npcs;
  
  var tbody = $("#tableNpcs").find('tbody');
  
  for(var i = 0; i < npcs.length; i++) {
    var npc = npcs[i];
    
    tbody.append($('<tr>')
      .append($('<td>')
        .append($('<a>')
          .attr('onclick', 'selectPoint(' + npc.x + ', ' + npc.y + ');')
          .text(npc.type)
        )
      )
      .append($('<td>').text(npc.name))
    );
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
  
  newCanvas.toBlob(function(blob) {
    saveAs(blob, world.name + ".png");
  });
}