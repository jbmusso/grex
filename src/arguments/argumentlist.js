module.exports = (function () {
  function ArgumentList() {
    this.args = [];
  }

  ArgumentList.prototype.toString = function() {
    return this.args.join(',');
  };

  return ArgumentList;
})();