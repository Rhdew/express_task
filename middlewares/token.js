const getRandomInt = () => {
  arr = [];
  let random;
  for (let i = 0; i < 50; i++) {
    random = 1;
    while (random) {
      random = Math.random() * 122;
      if (random >= 65 && random <= 90) {
        break;
      } else if (random >= 97 && random <= 122) {
        break;
      } else if (random >= 48 && random <= 57) {
        break;
      } else {
        random = 1;
      }
    }
    arr[i] = String.fromCharCode(random);
    console.log(String.fromCharCode(random));
  }
  return arr.join("");
};

module.exports = getRandomInt;
