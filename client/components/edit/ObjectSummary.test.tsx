import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import ObjectSummary from "./ObjectSummary";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));
jest.mock("./ObjectStatus", () => () => "ObjectStatus");

describe("ObjectSummary", () => {
    let editorValues;
    beforeEach(() => {
        editorValues = {
            state: {
                currentPid: "foo:123",
                objectDetailsStorage: {},
            },
            action: {
                extractFirstMetadataValue: jest.fn(),
                loadCurrentObjectDetails: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    it("displays loading message when appropriate", async () => {
        jest.spyOn(editorValues.action, "extractFirstMetadataValue").mockReturnValue("");
        const loadSpy = jest.spyOn(editorValues.action, "loadCurrentObjectDetails");
        const wrapper = mount(<ObjectSummary />);
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it("renders information from metadata when available", async () => {
        editorValues.state.objectDetailsStorage["foo:123"] = {
            metadata: {
                "dc:title": ["My title"],
                "dc:description": ["<p>Hello <b>world</b>!</p>"],
            },
        };
        const metaSpy = jest
            .spyOn(editorValues.action, "extractFirstMetadataValue")
            .mockReturnValueOnce("My title")
            .mockReturnValueOnce("<p>Hello <b>world</b>!</p>");
        const wrapper = mount(<ObjectSummary />);
        wrapper.update();
        expect(metaSpy).toHaveBeenCalledTimes(2);
        expect(metaSpy).toHaveBeenNthCalledWith(1, "dc:title", "Title not available");
        expect(metaSpy).toHaveBeenNthCalledWith(2, "dc:description", "");
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
