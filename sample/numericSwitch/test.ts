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
    case HelloEnum.F:
      return HelloEnum.EX;
    default:
      return "Not Three";
  }
};