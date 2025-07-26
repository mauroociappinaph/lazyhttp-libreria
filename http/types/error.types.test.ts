import * as ErrorTypes from "./error.types";

describe("ErrorTypes", () => {
  it("should import the module without errors", () => {
    expect(ErrorTypes).toBeDefined();
  });
  it("should create an instance of HttpError", () => {
    expect(new ErrorTypes.HttpError()).toBeInstanceOf(Error);
  });
});
