import React from "react";
import { describe, beforeEach, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamMetadataModalContent from "./DatastreamMetadataModalContent";

const mockUseDatastreamOperation = jest.fn();
jest.mock("../../../hooks/useDatastreamOperation", () => () => mockUseDatastreamOperation());
const mockDatatypeContent = jest.fn();
jest.mock("../../shared/DatatypeContent", () => (props) => {
    mockDatatypeContent(props);
    return "DatatypeContent";
});
describe("DatastreamMetadataModalContent", () => {
    let datastreamOperationValues;
    let response;
    let data;
    let createObjectURL;
    beforeEach(() => {
        datastreamOperationValues = {
            viewMetadata: jest.fn(),
        };
        data = "test3";
        createObjectURL = jest.fn().mockReturnValue(data);
        mockUseDatastreamOperation.mockReturnValue(datastreamOperationValues);
        Object.defineProperty(global, "URL", {
            value: {
                createObjectURL,
            },
            writable: true,
        });
    });

    it("renders", async () => {
        response = {
            data: "test1",
            mimeType: "test2",
        };
        datastreamOperationValues.viewMetadata.mockResolvedValue(response);
        let wrapper;
        await act(async () => {
            wrapper = await mount(<DatastreamMetadataModalContent />);
        });
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(datastreamOperationValues.viewMetadata).toHaveBeenCalled();
        expect(mockDatatypeContent).toHaveBeenCalledWith(response);
    });
});
