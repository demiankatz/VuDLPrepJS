import React, { useEffect, useState } from "react";
import DialogContent from "@mui/material/DialogContent";
import useDatastreamOperation from "../../../hooks/useDatastreamOperation";
import DatatypeContent from "../../shared/DatatypeContent";
import CircularProgress from "@mui/material/CircularProgress";

const DatastreamViewModalContent = (): React.ReactElement => {
    const [content, setContent] = useState({
        data: "",
        mimeType: "",
    });
    const { viewDatastream } = useDatastreamOperation();
    useEffect(() => {
        const getDatastream = async () => {
            const content = await viewDatastream();
            setContent(content);
        };
        getDatastream();
    }, []);
    const { data, mimeType } = content;

    if (data) {
        return (
            <DialogContent sx={{ minHeight: "50vh" }}>
                <DatatypeContent data={data} mimeType={mimeType} />
            </DialogContent>
        );
    }
    return (
        <DialogContent sx={{ minHeight: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress size="60px" />;
        </DialogContent>
    );
};

export default DatastreamViewModalContent;
