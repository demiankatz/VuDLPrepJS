import FedoraCatalog from "./FedoraCatalog";
import { FedoraObject } from "../models/FedoraObject";
import DatastreamManager from "./DatastreamManager";
import Config from "../models/Config";

describe("DatastreamManager", () => {
    let updateDatastreamFromFileSpy;
    let datastreamManager;
    let datastreamsSpy;
    beforeEach(() => {
        jest.spyOn(Config, "getInstance").mockReturnValue(null);
        updateDatastreamFromFileSpy = jest.spyOn(FedoraObject.prototype, "updateDatastreamFromFile");
        datastreamsSpy = jest.spyOn(FedoraCatalog.prototype, "getDatastreamMimetypes");
        datastreamManager = DatastreamManager.getInstance();
    });

    describe("hasValidMimeType", () => {
        beforeEach(() => {
            datastreamsSpy.mockReturnValue({
                WAV: {
                    mimetype: {
                        allowedType: "test1",
                        allowedSubtypes: "test2,test3,test4",
                    },
                },
                THUMBNAIL: {
                    mimetype: {
                        allowedType: "*",
                        allowedSubtypes: "test2,test3,test4",
                    },
                },
                MEDIUM: {
                    mimetype: {
                        allowedType: "test1",
                        allowedSubtypes: "*",
                    },
                },
                NOTYPES: {
                    mimetype: {},
                },
                NOMIMETYPE: {},
            });
        });

        it("returns false when subtype does not exist", () => {
            expect(datastreamManager.hasValidMimeType("WAV", "test1/test5")).toBeFalsy();
        });

        it("returns false when type does not exist", () => {
            expect(datastreamManager.hasValidMimeType("WAV", "test5/test2")).toBeFalsy();
        });

        it("returns false when mimetype does not follow pattern", () => {
            expect(datastreamManager.hasValidMimeType("WAV", "test1/test2/test3")).toBeFalsy();
        });

        it("returns false when allowedType/allowedSubtypes does not exist", () => {
            expect(datastreamManager.hasValidMimeType("NOTYPES", "test1/test2")).toBeFalsy();
        });

        it("returns false when mimetype does not exist", () => {
            expect(datastreamManager.hasValidMimeType("NOMIMETYPE", "test1/test2")).toBeFalsy();
        });

        it("returns true when type/subtype does exist", () => {
            expect(datastreamManager.hasValidMimeType("WAV", "test1/test2")).toBeTruthy();
        });

        it("returns true for any type", () => {
            expect(datastreamManager.hasValidMimeType("THUMBNAIL", "anythingreally/test2")).toBeTruthy();
        });

        it("returns true for any subtype", () => {
            expect(datastreamManager.hasValidMimeType("MEDIUM", "test1/anythingworks")).toBeTruthy();
        });
    });

    describe("uploadFile", () => {
        let hasValidMimeTypeSpy;
        let pid;
        let stream;
        let filepath;
        let mimeType;
        beforeEach(() => {
            pid = "test1";
            stream = "test2";
            filepath = "test3";
            mimeType = "test4";
            hasValidMimeTypeSpy = jest.spyOn(datastreamManager, "hasValidMimeType");
        });

        it("calls updateDataStreamFromFile when mime type is valid", async () => {
            updateDatastreamFromFileSpy.mockResolvedValue(false);
            hasValidMimeTypeSpy.mockReturnValue(true);

            await datastreamManager.uploadFile(pid, stream, filepath, mimeType);

            expect(hasValidMimeTypeSpy).toHaveBeenCalledWith(stream, mimeType);
            expect(updateDatastreamFromFileSpy).toHaveBeenCalledWith(filepath, stream, mimeType);
        });

        it("throws an error when mime type is invalid", async () => {
            hasValidMimeTypeSpy.mockReturnValue(false);
            expect(datastreamManager.uploadFile(pid, stream, filepath, mimeType)).rejects.toThrowError(
                "Invalid mime type: " + mimeType
            );
        });
    });
});