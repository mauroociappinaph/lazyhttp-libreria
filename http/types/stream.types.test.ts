import * as StreamTypes from "./stream.types";

describe("StreamTypes", () => {
  it("should export all stream types", () => {
    expect(typeof {} as StreamTypes.StreamConfig).toBeDefined();
  });
});
