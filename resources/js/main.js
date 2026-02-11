var canvasContainer = document.querySelector("#canvasContainer");
var panzoomContainer = document.querySelector("#panzoomContainer");

var canvas = document.querySelector("#canvas");
var overlayCanvas = document.querySelector("#overlayCanvas");
var selectionCanvas = document.querySelector("#selectionCanvas");

var selectionCtx = selectionCanvas.getContext("2d");

var blockSelector = document.querySelector("#blocks");

selectionCtx.msImageSmoothingEnabled = false;
selectionCtx.mozImageSmoothingEnabled = false;
selectionCtx.msImageSmoothingEnabled = false;
selectionCtx.imageSmoothingEnabled = false;

var file;

var world;

var worker = null;

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

  var selectedValues = [];

  // clear and set selectedInfos
  for(j = 0; j < blockSelector.options.length; j++) {
    option = blockSelector.options[j];
    
    var tileInfo = getTileInfoFromOption(option);

    if (
      tileInfo &&
      set.Entries.some(
        (entry) =>
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
      if (option.prop) option.prop("selected", false);
      option.selected = false;
    }
  }

  // console.log({blockSelector});

  console.log({set});

  // blockSelector.val(selectedValues);

  worker.postMessage({ search: set.Entries });
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
    option.text = `${tile.Name} (Tile ${i})`;
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

function addItemSelectOptions() {
  for(var i = 0; i < settings.Items.length; i++) {
    var item = settings.Items[i];

    item.isItem = true;

    var option = document.createElement("option");
    option.text = `${item.Name} (Item ${item.Id})`;
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

function findBlock(direction) {
  worker?.postMessage?.({
    findNext: { x: selectionX, y: selectionY, direction },
  });
}

function highlightAll() {
  if (world) {
    worker.postMessage({ search: getSelectedInfos() });
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

function clearHighlight() {
  selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
  worker?.postMessage?.({ clearHighlight: true });
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

  const scaleX = rect.width / (panzoomContainer.width + 0.5);
  const scaleY = rect.height / (panzoomContainer.height + 0.5);

  var mousePos =  {
    x: Math.floor((evt.clientX - rect.left) / scaleX),
    y: Math.floor((evt.clientY - rect.top) / scaleY)
  };

  // console.log(`${evt.clientX}\t${evt.clientY}\t${rect.left}\t${rect.top}\t${scale}\t${mousePos.x}\t${mousePos.y}`);

  return mousePos;
}

function getItemText(item) {
  let prefix = "";

  if(item.prefix > 0 && item.prefix < settings.ItemPrefix.length)
    prefix = settings.ItemPrefix[item.prefix].Name;

  let itemName = item.id;
  for(let itemIndex = 0; itemIndex < settings.Items.length; itemIndex++) {
    let itemSettings = settings.Items[itemIndex];
    if(Number(itemSettings.Id) === item.id) {
      itemName = itemSettings.Name;
      break;
    }
  }
  return `${prefix} ${itemName} (${item.stack})`;
}

var mouseMoveDebounce = null;
var lastMouseMovePos = { x: 0, y: 0 };
panzoomContainer.addEventListener('mousemove', evt => {
  if(!world)
    return;

  var mousePos = getMousePos(panzoomContainer, evt);
  var x = mousePos.x;
  var y = mousePos.y;

  clearTimeout(mouseMoveDebounce);
  if (Math.hypot(lastMouseMovePos.x - x, lastMouseMovePos.y - y) > 20) {
    worker.postMessage({ hoverTile: { x, y } });
    lastMouseMovePos = { x, y };
  } else {
    mouseMoveDebounce = setTimeout(() => {
      worker.postMessage({ hoverTile: { x, y } });
      lastMouseMovePos = { x, y };
    }, 75);
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
  worker.postMessage({ selectTile: { x, y } });
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
  selectionX = Math.round(x);
  selectionY = Math.round(y);
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

function getTileInfoList(tile) {
  const info = [];
  const fields = [
    ['actuated', 'Actuated'],
    ['echoCoatBlock', 'Echo Coat Block'],
    ['echoCoatWall', 'Echo Coat Wall'],
    ['illuminantBlock', 'Illuminant Block'],
    ['illuminantWall', 'Illuminant Wall'],
    ['liquidAmount', 'Liquid Amount'],
    ['slope', 'Slope'],
  ];
  for (const [key, label] of fields) {
    if (tile[key]) {
      info.push(`${label}: ${tile[key]}`);
    }
  }
  if (tile.blockPaint > 0) {
    info.push(`Block Paint: ${settings.Paints[tile.blockPaint].Name}`);
  }
  if (tile.wallPaint > 0) {
    info.push(`Wall Paint: ${settings.Paints[tile.wallPaint].Name}`);
  }
  return info.sort();
}

function fileNameChanged (evt) {
  file = evt.target.files[0];

  $("#help").hide();

  reloadWorld();
}

function reloadWorld() {
  if (worker === null) {
    worker = new Worker('wasm/src/build/terramap.js');
    worker.addEventListener('message', onWorldLoaderWorkerMessage);
    const offscreen = canvas.transferControlToOffscreen();
    const offscreenOverlay = overlayCanvas.transferControlToOffscreen();
    worker.postMessage({ canvas: offscreen, overlayCanvas: offscreenOverlay }, [
      offscreen,
      offscreenOverlay,
    ]);
  }

  worker.postMessage({ file });
}

function onWorldLoaderWorkerMessage(e) {
  if(e.data.status)
    $("#status").html(e.data.status);

  if (e.data.tile) {
    $("#tileInfoList").empty();
    const tile = e.data.tile;
    for (const row of getTileInfoList(tile)) {
      $("#tileInfoList").append(`<li>${row}</li>`);
    }
    if (tile.chest) {
      if (tile.chest.name.length > 0) {
        tile.text += ` - ${tile.chest.name}`;
      }
      for (const item of tile.chest.items) {
        $("#tileInfoList").append(`<li>${getItemText(item)}</li>`);
      }
    }
    if (tile.tileEntity && tile.tileEntity.items.length > 1) {
      const items = tile.tileEntity.items;
      const dyes = tile.tileEntity.dyes;
      for (let i = 0; i < items.length; ++i) {
        if (items[i].id > 0) {
          $("#tileInfoList").append(`<li>${getItemText(items[i])}</li>`);
        }
        if (dyes[i].id > 0) {
          $("#tileInfoList").append(`<li>${getItemText(dyes[i])}</li>`);
        }
      }
    }
    if (tile.sign && tile.sign.text.length > 0) {
      const signText = tile.sign.text.trim().replaceAll('\n', '<br>');
      $("#tileInfoList").append(`<li>${signText}</li>`);
    }
    $("#tile").html(tile.text);
  }

  if(e.data.world) {
    world = e.data.world;

    panzoomContainer.width = world.width;
    panzoomContainer.height = world.height;
    selectionCanvas.width = world.width;
    selectionCanvas.height = world.height;

    resizeCanvases();

    $("#worldPropertyList").empty();

    Object.keys(world).filter(key => {
      const value = world[key];
      const type = typeof value;
      return type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint' || (
        Array.isArray(value) && value.length < 5 && key !== 'npcs' && key !== 'signs'
      );
    }).sort()
    .forEach(key => 
      $("#worldPropertyList").append(
        `<li>${key}: ${Array.isArray(world[key]) ? JSON.stringify(world[key]) : world[key]}</li>`
      )
    );

    addNpcs(world.npcs);
  }

  if (e.data.select) {
    selectPoint(e.data.select.x, e.data.select.y);
  }
}

function addNpcs(npcs) {
  $("#npcList").empty();

  for(var i = 0; i < npcs.length; i++) {
    var npc = npcs[i];

    var npcText = npc.type;
    if (npc.name && npc.type != npc.name) {
      npcText = `${npc.name} the ${npc.type}`;
    }

    $("#npcList").append(`<li><a href="#" onclick="selectPoint(${npc.x}, ${npc.y})">${npcText}</a></li>`);
  }
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
