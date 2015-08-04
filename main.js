var canvasContainer = document.querySelector("#canvasContainer");
var panzoomContainer = document.querySelector("#panzoomContainer");

var canvas = document.querySelector("#canvas");
var overlayCanvas = document.querySelector("#overlayCanvas");

var ctx = canvas.getContext("2d");
var overlayCtx = overlayCanvas.getContext("2d");

var blockSelector = document.querySelector("#blocks");

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

resize();

// handle scrolling in and out
panzoom.parent().on('mousewheel.focal', function (e) {

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
});

for(var idx = 0; idx < settings.Tiles.length; idx++) {
  var tile = settings.Tiles[idx];
  var option = document.createElement("option");
  option.text = tile.Name;
  option.value = idx;
  blockSelector.add(option);
}

function previousBlock(e) {
  findBlock(-1);
}

function nextBlock(e) {
  findBlock(1);
}

function findBlock(direction) {
  if(!world)
    return;
    
  var selectedIndex = blockSelector.options[blockSelector.selectedIndex].value;
  var tileSettings = settings.Tiles[selectedIndex];
  
  var x = selectionX;
  var y = selectionY + direction;
  
  var start = x * world.height + y;
  
  for(var i = start; i >= 0 && i < world.tiles.length; i += direction) {
    var tile = world.tiles[i];
    if(tile && tile.Type == selectedIndex) {
      selectionX = x;
      selectionY = y;

      drawSelectionIndicator();
      // panzoom.panzoom('pan', (-overlayCanvas.width / 2) - x, (-overlayCanvas.height / 2) - y, { relative: false });

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
  }
}

function highlightAll(e) {
  if(!world)
    return;
    
  var selectedIndex = blockSelector.options[blockSelector.selectedIndex].value;
  var tileSettings = settings.Tiles[selectedIndex];
  
  var x = 0;
  var y = 0;
  
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  overlayCtx.fillStyle = "rgba(0, 0, 0, 0.75)";
  overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  
  for(var i = 0; i < world.tiles.length; i++) {
    var tile = world.tiles[i];
    if(tile && tile.Type == selectedIndex) {
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

function resetPanZoom(e) {
  panzoom.panzoom('reset');  
}

function resize() {
  var width = window.innerWidth * 0.99;
  
  canvasContainer.height = window.innerHeight;
  
  var ratio = panzoomContainer.height/panzoomContainer.width;
  var height = width * ratio;
  
  panzoomContainer.style.width = width+'px';
  panzoomContainer.style.height = height+'px';
  canvas.style.width = width+'px';
  overlayCanvas.style.width = width+'px';
  // canvas.style.height = height+'px';
  
  // var rect = canvas.getBoundingClientRect();

  // offsetX=rect.left;
  // offsetY=rect.top;
  // cw=canvas.width;
  // ch=canvas.height;
  
  drawSelectionIndicator();
}

function getMousePos(canvas, evt) {
  var rect = panzoomContainer.getBoundingClientRect();
  var transform = $(panzoomContainer).panzoom('getMatrix');
  
  var scale = transform[0];
  
  scale = rect.width / panzoomContainer.width;
  
  return {
    x: Math.floor((evt.clientX - rect.left) / scale),
    y: Math.floor((evt.clientY - rect.top) / scale)
  };
}

var leftButtonDown = false;
var leftButtonDragged = false;

panzoomContainer.addEventListener('mousedown', function(evt) {
  if(evt.which === 1) leftButtonDown = true;
}, false);

panzoomContainer.addEventListener('mouseup', function(evt) {  
  if(evt.which === 1) {
    leftButtonDown = false;

    if(leftButtonDragged) {
      leftButtonDragged = false;
      return;
    }
    
    leftButtonDragged = false;
  }
  
  var mousePos = getMousePos(panzoomContainer, evt);
  
  selectionX = mousePos.x;
  selectionY = mousePos.y;
  
  drawSelectionIndicator();
}, false);

panzoomContainer.addEventListener('mousemove', function(evt) {
  if(evt.which === 1 && leftButtonDown) {
    leftButtonDragged = true;
  }
    
  if(!world) 
    return;
    
  var mousePos = getMousePos(panzoomContainer, evt);
  $("#position").html(mousePos.x + ',' + (mousePos.y));
  
  if(world.tiles) {
    var index = mousePos.x * world.height + mousePos.y;
    
    if(index >= 0 && index < world.tiles.length) {
      var tile = world.tiles[index];
      
      var text = getTileText(tile);
      
      $("#tile").html(text);
    }
  }
}, false);

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
}

function getTileText (tile) {
  var text = "";
  
  if(tile) {
    if(tile.Type || tile.Type === 0) {
      
      if(tile.Type < settings.Tiles.length) {
        var tileSettings = settings.Tiles[tile.Type];
        
        text = tileSettings.Name;
        
        if(tile.TextureU > 0 && tileSettings.Frames) {
          var frame;
          
          for(var i = 0; i < tileSettings.Frames.length; i++) {
            var temp = tileSettings.Frames[i];
            
            if(temp.U <= tile.TextureU)
              frame = temp;
            else
              break;
          }
          
          if(frame) {
            if(frame.Name) {
              text = frame.Name;
              
              if(frame.Variety)
                text += " " + frame.Variety;
            }
            else if (frame.Variety)
              text += " " + frame.Variety;
          }
        }
        
        if(tile.TextureU > 0 && tile.TextureV > 0)
          text += " (" + tile.Type + ", " + tile.TextureU + ", " + tile.TextureV + ")";
        else if(tile.TextureU > 0)
          text += " (" + tile.Type + ", " + tile.TextureU + ")";
        else
          text += " (" + tile.Type + ")";
      }
      else {
        text = "Unknown Tile (" + tile.Type + ")";
      }
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
  }
  
  if(!text)
    text = "Nothing";
  
  if(tile) {
    if(tile.IsRedWirePresent)
      text += " (Red Wire)";
      
    if(tile.IsGreenWirePresent)
      text += " (Green Wire)";
      
    if(tile.IsBlueWirePresent)
      text += " (Blue Wire)";
  }
    
  return text;
}

function fileNameChanged (evt) {
  var worker = new Worker('WorldLoader.js');
  worker.addEventListener('message', function(e) {
    if(e.data.status)
      $("#status").html(e.data.status);
      
    if(e.data.world) {
      world = e.data.world;
    
      panzoomContainer.width = world.width;
      panzoomContainer.height = world.height;
      canvas.width = world.width;
      canvas.height = world.height;
      overlayCanvas.width = world.width;
      overlayCanvas.height = world.height;
      
      world.tiles = [];
      
      resize();
      
      $("#accordion").css("display", "block");

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
      
    // if(e.data.x && e.data.y && e.data.color) {
    //   // setTimeout( 
    //   //   function() {
    //   ctx.fillStyle = e.data.color;
    //   ctx.fillRect("). e.data.y, 1, 1);
    //     // }, 0);
    // }
    
    if(e.data.tiles) {
      var x = e.data.x;
      
      for(var i = 0; i < e.data.tiles.length; i++) {
        var tile = e.data.tiles[i];
        
        if(tile) {
          world.tiles.push(tile);
          
          // ctx.fillStyle = tile.color;
          ctx.fillStyle = getTileColor(i, tile, world);
          ctx.fillRect(x, i, 1, 1);
        }
      }
    }
  });
  
  worker.postMessage(evt.target.files[0]);
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

function abortRead() {
	reader.abort();
}

function errorHandler(evt) {
  switch (evt.target.error.code) {
  	case evt.target.error.NOT_FOUND_ERR:
  	$("#status").html('File Not Found!');
  		break;
  	case evt.target.error.NOT_READABLE_ERR:
  		$("#status").html('File is not readable');
  		break;
  	case evt.target.error.ABORT_ERR:
  		break; // noop
  	default:
  	$("#status").html('An error occurred reading this file.');
  }
}

function updateProgress(evt) {
  // // evt is an ProgressEvent.
  // if (evt.lengthComputable) {
  //   $scope.percentLoaded = Math.round((evt.loaded / evt.total) * 100);
  //   $scope.$apply();
  // }
}

