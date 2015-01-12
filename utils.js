exports.titleCase = function titleCase(string) {
  return string.replace(/\b\w/g, function (letter) {
    return letter.toUpperCase();
  });
};

exports.grep = function grep(text, regexp, process) {
  var match = text.match(regexp);
  if(match) {
    if(process) {
      return process.apply(this, match);
    } else {
      return match[0];
    }
  } else {
    return null;
  }
}

