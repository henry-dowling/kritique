const porcupineModel = {
  publicPath: "porcupine_params.pv",
  customWritePath: "3.0.0_porcupine_params.pv",
};

(function () {
  if (typeof module !== "undefined" && typeof module.exports !== "undefined")
    module.exports = porcupineModel;
})();

export default porcupineModel;
