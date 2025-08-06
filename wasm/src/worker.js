self.addEventListener('message', (e) => {
  if (e.data.canvas) {
    self.canvas = e.data.canvas;
    self.canvas.width = 100;
    self.canvas.height = 100;
    self.ctx = self.canvas.getContext('2d');
    self.ctx.msImageSmoothingEnabled = false;
    self.ctx.mozImageSmoothingEnabled = false;
    self.ctx.msImageSmoothingEnabled = false;
    self.ctx.imageSmoothingEnabled = false;
  }
  if (e.data.file) {
    self.start(e.data.file);
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
  self.postMessage({ world });

  self.postMessage({ status: 'Rendering tiles...' });
  self.terramap.renderToCanvas();
}
