Module.initializedPromise = new Promise((resolve) => {
  Module['onRuntimeInitialized'] = resolve;
});

Module['terramap'] = async () => {
  await Module.initializedPromise;
  return new Module['Loader']();
};
