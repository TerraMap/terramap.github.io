self.addEventListener('message', (e) => self.start(e.data));

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
  self.postMessage({ world });
}
