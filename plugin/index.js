function NextAxiosNetworkPlugin(options) {
  let hasRunOnce = false;
  return {
    apply: () => {
      if (!hasRunOnce && process.env.NODE_ENV === 'development') {
        require('../server')
      }
      hasRunOnce = true;
    },
  };
}

module.exports = NextAxiosNetworkPlugin;
