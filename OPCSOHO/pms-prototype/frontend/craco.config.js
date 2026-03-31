module.exports = {
  devServer: (devServerConfig) => {
    devServerConfig.client = {
      ...(devServerConfig.client || {}),
      overlay: false,
    };

    return devServerConfig;
  },
};
