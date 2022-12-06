const GetLength = val => {
  switch (val) {
    case 3:
    case 2:
      return "Three";
    case 6:
    case 7:
    case 8:
    case 10:
    case 11:
    case 12:
      return "EX";
    default:
      return "Not Three";
  }
};