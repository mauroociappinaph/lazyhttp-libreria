import { generateCurl } from "./generate-curl";
import { FullResponseMetadata } from "../types/core/response.types";

describe("generateCurl", () => {
  it("should generate a simple GET curl command", () => {
    const cmd = generateCurl({ method: "get", url: "https://api.com/data" });
    expect(cmd).toBe(`curl -X GET 'https://api.com/data'`);
  });

  it("should generate a POST curl with headers and JSON body", () => {
    const cmd = generateCurl({
      method: "post",
      url: "https://api.com/data",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
      body: { foo: "bar" },
    });
    expect(cmd).toBe(
      `curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer token' --data '{"foo":"bar"}' 'https://api.com/data'`
    );
  });

  it("should generate a PUT curl with custom headers and string body", () => {
    const cmd = generateCurl({
      method: "put",
      url: "https://api.com/item/1",
      headers: { "X-Custom": "abc" },
      body: "rawdata",
    });
    expect(cmd).toBe(
      `curl -X PUT -H 'X-Custom: abc' --data 'rawdata' 'https://api.com/item/1'`
    );
  });

  it("should use meta.requestHeaders if provided", () => {
    const meta: FullResponseMetadata = {
      requestHeaders: { "X-From-Meta": "yes" },
      responseHeaders: {},
      timing: { requestStart: 1, responseEnd: 2 },
      rawBody: "",
      errorDetails: undefined,
    };
    const cmd = generateCurl({ method: "get", url: "https://api.com" }, meta);
    expect(cmd).toBe(`curl -X GET -H 'X-From-Meta: yes' 'https://api.com'`);
  });
});
