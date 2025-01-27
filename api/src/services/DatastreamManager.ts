import Config from "../models/Config";
import { FedoraObject } from "../models/FedoraObject";
import FedoraCatalog from "./FedoraCatalog";
import { Agent } from "./interfaces";
import MetadataExtractor from "./MetadataExtractor";

class DatastreamManager {
    private static instance: DatastreamManager;
    fedoraCatalog: FedoraCatalog;
    config: Config;

    constructor(fedoraCatalog: FedoraCatalog, config: Config) {
        this.config = config;
        this.fedoraCatalog = fedoraCatalog;
    }

    static getInstance(): DatastreamManager {
        if (!DatastreamManager.instance) {
            DatastreamManager.instance = new DatastreamManager(FedoraCatalog.getInstance(), Config.getInstance());
        }
        return DatastreamManager.instance;
    }

    async getMetadata(pid: string, stream: string): Promise<string> {
        const fedoraObject = FedoraObject.build(pid);
        const xml = await fedoraObject.getDatastreamMetadata(stream);
        return xml;
    }

    async getMimeType(pid: string, stream: string): Promise<string> {
        const metadataExtractor = MetadataExtractor.getInstance();
        const xml = await this.getMetadata(pid, stream);
        const ebuNode = metadataExtractor.extractEbuCore(xml, "//ebucore:hasMimeType");
        return ebuNode?.hasMimeType?.[0] || "";
    }

    async downloadBuffer(pid: string, stream: string): Promise<Buffer> {
        const fedoraObject = FedoraObject.build(pid);
        return await fedoraObject.getDatastreamAsBuffer(stream);
    }

    async uploadFile(pid: string, stream: string, filepath: string, mimeType: string): Promise<void> {
        const fedoraObject = FedoraObject.build(pid);

        if (this.hasValidMimeType(stream, mimeType)) {
            try {
                await fedoraObject.updateDatastreamFromFile(filepath, stream, mimeType);
            } catch (error) {
                console.error(error);
                if (error?.name === "HttpError" && error.statusCode === 410) {
                    await fedoraObject.deleteDatastreamTombstone(stream);
                    await fedoraObject.updateDatastreamFromFile(filepath, stream, mimeType);
                }
            }
        } else {
            throw new Error(`Invalid mime type: ${mimeType}`);
        }
    }

    async uploadLicense(pid: string, stream: string, licenseKey: string): Promise<void> {
        const fedoraObject = FedoraObject.build(pid);
        await fedoraObject.modifyLicense(stream, licenseKey);
    }

    async uploadAgents(pid: string, stream: string, agents: Array<Agent>): Promise<void> {
        const fedoraObject = FedoraObject.build(pid);
        const xml = await fedoraObject.getDatastream(stream, true);
        const metadataExtractor = MetadataExtractor.getInstance();
        const agentsAttributes = xml
            ? metadataExtractor.extractAgentsAttributes(xml)
            : { createDate: "", modifiedDate: "", recordStatus: "" };
        await fedoraObject.modifyAgents(stream, agents, agentsAttributes);
    }

    async getLicenseKey(pid: string, stream: string): Promise<string> {
        const fedoraObject = FedoraObject.build(pid);
        const xml = await fedoraObject.getDatastream(stream);
        const metadataExtractor = MetadataExtractor.getInstance();
        const license = metadataExtractor.extractLicense(xml) || "";
        const licenseMapping = Object.entries(this.config.licenses).find((configLicense) => {
            return configLicense[1]?.uri == license;
        });
        return licenseMapping?.[0] || "";
    }

    async getAgents(pid: string, stream: string): Promise<Array<Agent>> {
        const fedoraObject = FedoraObject.build(pid);
        const xml = await fedoraObject.getDatastream(stream);
        const metadataExtractor = MetadataExtractor.getInstance();
        return metadataExtractor.getAgents(xml);
    }

    async deleteDatastream(pid: string, stream: string): Promise<void> {
        const fedoraObject = FedoraObject.build(pid);
        await fedoraObject.deleteDatastream(stream);
    }

    hasValidMimeType(stream: string, mimeType: string): boolean {
        const mimeTypeHierarchy = mimeType.split("/");
        const allowedType = this.fedoraCatalog.getDatastreamMimetypes()?.[stream]?.mimetype?.allowedType;
        const allowedSubtypes = this.fedoraCatalog.getDatastreamMimetypes()?.[stream]?.mimetype?.allowedSubtypes;
        if (mimeTypeHierarchy.length == 2) {
            const [type, subtype] = mimeTypeHierarchy;
            return (
                allowedType &&
                allowedSubtypes &&
                (allowedType.includes(type) || allowedType.includes("*")) &&
                (allowedSubtypes.includes(subtype) || allowedSubtypes.includes("*"))
            );
        }
        return false;
    }
}

export default DatastreamManager;
