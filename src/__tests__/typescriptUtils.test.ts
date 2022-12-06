import "jest";

import { getConstEnumsFromTsConfig } from "../typescriptUtils";


describe("typescriptUtils", () => {
  describe("getConstEnums", () => {
    it("should fail if file doesn't exist", () => {
      expect(() => getConstEnumsFromTsConfig("abc")).toThrowError(/Can\'t find tsconfig file/);
    });

    it("should discover an enum from project with a single d.ts file", () => {
      const result = getConstEnumsFromTsConfig("./sample/numericSimple/tsconfig.json");
      expect(result.length).toEqual(1);
      
      const [testEnum] = result;
      expect(testEnum.name.escapedText.toString()).toEqual("TestEnum");
    });
  });
});
