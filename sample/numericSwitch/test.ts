const GetLength = (val: HelloEnum) => {
  switch (val) {
    case HelloEnum.Hej:
    case HelloEnum.Hey:
      return "Three";
    case HelloEnum.A:
    case HelloEnum.B:
    case HelloEnum.C:
    case HelloEnum.D:
    case HelloEnum.E:
      return "ABCDE";
    default:
      return "Not Three";
  }
};