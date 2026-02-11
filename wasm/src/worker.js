self.addEventListener('message', (e) => {
  if (e.data.canvas) {
    self.canvas = e.data.canvas;
    self.ctx = self.canvas.getContext('2d');
    self.ctx.msImageSmoothingEnabled = false;
    self.ctx.mozImageSmoothingEnabled = false;
    self.ctx.imageSmoothingEnabled = false;
  }
  if (e.data.overlayCanvas) {
    self.overlayCanvas = e.data.overlayCanvas;
    self.overlayCtx = self.overlayCanvas.getContext('2d');
    self.overlayCtx.msImageSmoothingEnabled = false;
    self.overlayCtx.mozImageSmoothingEnabled = false;
    self.overlayCtx.imageSmoothingEnabled = false;
  }
  if (e.data.file) {
    self.start(e.data.file);
  }
  if (e.data.hoverTile) {
    onHoverTile(e.data.hoverTile);
  }
  if (e.data.selectTile) {
    onSelectTile(e.data.selectTile);
  }
  if (e.data.search) {
    onSearch(e.data.search);
  }
  if (e.data.clearHighlight) {
    const { width, height } = self.overlayCanvas;
    self.overlayCtx.clearRect(0, 0, width, height);
  }
  if (e.data.findNext) {
    onFindNext(e.data.findNext);
  }
});

async function start(file) {
  const fileReader = new FileReaderSync();

  self.postMessage({ status: 'Reading world file...' });
  const buffer = fileReader.readAsArrayBuffer(file);

  self.postMessage({ status: 'Loading world file...' });
  if (typeof self.terramap === 'undefined') {
    self.terramap = await Module.terramap();
  }
  const world = self.terramap.loadWorldFile(buffer);
  console.log(world);
  if (
    world.width <= 0 ||
    world.height <= 0 ||
    world.width > 33600 ||
    world.height > 9600
  ) {
    return;
  }
  self.canvas.width = world.width;
  self.canvas.height = world.height;
  self.overlayCanvas.width = world.width;
  self.overlayCanvas.height = world.height;

  self.postMessage({ status: 'Rendering tiles...', world });
  self.terramap.renderToCanvas();
  self.postMessage({ status: 'Done.', done: true });
}

function getTileInfo(tile) {
  const tileInfo = settings.Tiles[tile.blockId];
  if (tileInfo && tileInfo.Frames) {
    for (const frame of tileInfo.Frames.slice().reverse()) {
      if (
        ((!frame.U && !tile.frameX) || frame.U <= tile.frameX) &&
        ((!frame.V && !tile.frameY) || frame.V <= tile.frameY)
      ) {
        frame.parent = tileInfo;
        return frame;
      }
    }
  }
  return tileInfo;
}

function getTileText(tile) {
  let text = 'Nothing';
  const tileInfo = getTileInfo(tile);
  if (tileInfo) {
    if (tileInfo.parent && tileInfo.parent.Name) {
      text = tileInfo.parent.Name;
      if (tileInfo.Name) {
        text += ` - ${tileInfo.Name}`;
      }
      if (tileInfo.Variety) {
        text += ` - ${tileInfo.Variety}`;
      }
    } else {
      text = tileInfo.Name;
    }

    if (tile.frameX === 0 && tile.frameY === 0) {
      text += ` (${tile.blockId})`;
    } else {
      text += ` (${tile.blockId}, ${tile.frameX}, ${tile.frameY})`;
    }
    if (tile.tileEntity) {
      const entity = tile.tileEntity;
      if (entity.type === 2) {
        const sensorType = tileInfo.CheckTypes[entity.sensorType];
        const on = entity.sensorActive ? 'On' : 'Off';
        text += ` - ${sensorType}, ${on}`;
      } else if (entity.items.length === 1) {
        const itemId = entity.items[0].id;
        for (const itemSettings of settings.Items) {
          if (Number(itemSettings.Id) === itemId) {
            text += ` - ${itemSettings.Name}`;
            break;
          }
        }
      }
    }
  } else if (tile.wallId >= settings.Walls.length) {
    text = `Unknown Wall (${tile.wallId})`;
  } else if (tile.wallId > 0) {
    text = `${settings.Walls[tile.wallId].Name} (${tile.wallId})`;
  }

  if (tile.liquid) {
    text = text === 'Nothing' ? tile.liquid : `${text} ${tile.liquid}`;
  }
  const flagFields = [
    ['wireRed', 'Red Wire'],
    ['wireBlue', 'Blue Wire'],
    ['wireGreen', 'Green Wire'],
    ['wireYellow', 'Yellow Wire'],
    ['actuator', 'Actuator'],
  ];
  const flags = [];
  for (const [key, label] of flagFields) {
    if (tile[key]) {
      flags.push(label);
    }
  }
  if (flags.length > 0) {
    text += ` (${flags.join(', ')})`;
  }

  return text;
}

function onHoverTile({ x, y }) {
  const tile = self.terramap.getTile(x, y);
  if (tile) {
    self.postMessage({ status: `${getTileText(tile)} (${x}, ${y})` });
  }
}

function onSelectTile({ x, y }) {
  const tile = self.terramap.getTile(x, y);
  if (tile) {
    tile.text = getTileText(tile);
    self.postMessage({ tile });
  }
}

function onSearch(search) {
  const queries = [];
  for (const info of search) {
    if (info.isTile) {
      if (info.parent) {
        let sizeX = 1;
        let sizeY = 1;
        if (info.parent.Size) {
          sizeX = info.parent.Size[0] - '0';
          sizeY = info.parent.Size[2] - '0';
        }
        queries.push({
          type: 1,
          id: Number(info.parent.Id),
          minU: info.U,
          maxU: info.U + 18 * sizeX,
          minV: info.V,
          maxV: info.V + 18 * sizeY,
        });
      } else {
        queries.push({ type: 0, id: Number(info.Id) });
      }
    } else if (info.isWall) {
      queries.push({ type: 2, id: Number(info.Id) });
    } else if (info.isItem) {
      queries.push({ type: 3, id: Number(info.Id) });
    }
  }
  self.terramap.search(queries);
}

function onFindNext({ x, y, direction }) {
  const pos = self.terramap.findNext(x, y, direction);
  if (pos) {
    self.postMessage({ select: { x: pos[0], y: pos[1] } });
  }
}
