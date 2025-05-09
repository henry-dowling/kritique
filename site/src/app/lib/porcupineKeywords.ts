const porcupineKeywords = [
  {
    publicPath: "hey_lex.ppn",
    label: "KritiqueWakeWord",
  },
];

(function () {
  if (typeof module !== "undefined" && typeof module.exports !== "undefined")
    module.exports = porcupineKeywords;
})();

export default porcupineKeywords;
