import { run } from "../src/version-check";
import * as github from "@actions/github";
import * as core from "@actions/core";

jest.mock("@actions/core");
jest.mock("@actions/github");

const gh = github.getOctokit("_");
const getContentMock = jest.spyOn(gh.rest.repos, "getContent");
const errMock = jest.spyOn(core, "error");

let inputs = {};
let outputs = {};
beforeAll(() => {
  jest.spyOn(core, "getInput").mockImplementation((name) => inputs[name]);
  jest
    .spyOn(core, "setOutput")
    .mockImplementation((name, value) => (outputs[name] = value));

  core.setOutput("test", "test");
});

afterEach(() => {
  jest.restoreAllMocks();
  inputs = {};
  outputs = {};
});

describe("run", () => {
  it("checks token provided", async () => {
    await run();

    expect(errMock).toHaveBeenCalledTimes(1);
    expect(errMock).toHaveBeenCalledWith(Error("repo-token not provided"));
  });

  it("checks package.json", async () => {
    mockInputs({ "repo-token": "_" });
    mockContent({ message: "Not Found" });

    await run();

    expect(errMock).toHaveBeenCalledTimes(1);
    expect(errMock).toHaveBeenCalledWith(
      Error("Could not find file package.json")
    );
  });

  it("checks composer.json", async () => {
    mockInputs({ "repo-token": "_", path: "composer.json" });
    mockContent({ message: "Not Found" });

    await run();

    expect(errMock).toHaveBeenCalledTimes(1);
    expect(errMock).toHaveBeenCalledWith(
      Error("Could not find file composer.json")
    );
  });

  it("check version returned", async () => {
    mockInputs({ "repo-token": "_" });
    mockContent({ type: "file", content: { version: "1.0.0" } });

    await run();

    checkOutput("version", "1.0.0");
    expect(getContentMock).toHaveBeenCalledTimes(1);
  });

  describe("compare versions", function () {
    it("major", async () => {
      mockInputs({ "repo-token": "_", compare: "0.0.1" });
      mockContent({ type: "file", content: { version: "1.0.0" } });

      await run();

      checkOutput("version-diff", "major");
      expect(getContentMock).toHaveBeenCalledTimes(1);
    });
    it("minor", async () => {
      mockInputs({ "repo-token": "_", compare: "0.0.1" });
      mockContent({ type: "file", content: { version: "0.1.0" } });

      await run();

      checkOutput("version-diff", "minor");
      expect(getContentMock).toHaveBeenCalledTimes(1);
    });
    it("patch", async () => {
      mockInputs({ "repo-token": "_", compare: "0.0.1" });
      mockContent({ type: "file", content: { version: "0.0.2" } });

      await run();

      checkOutput("version-diff", "patch");
      expect(getContentMock).toHaveBeenCalledTimes(1);
    });
  });
});

function mockInputs(mocked: { [key: string]: string }): void {
  inputs = mocked;
}

function mockContent(data: object) {
  if ("content" in data) {
    data["content"] = Buffer.from(JSON.stringify(data["content"])).toString(
      "base64"
    );
  }
  getContentMock.mockResolvedValue(<any>{ data });
}

function checkOutput(name: string, value: string) {
  expect(outputs[name]).toEqual(value);
}
