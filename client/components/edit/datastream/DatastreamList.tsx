import React from "react";
import Datastream from "./Datastream";
import List from "@mui/material/List";
import { useEditorContext } from "../../../context/EditorContext";

const DatastreamList = (): React.ReactElement => {
    const {
        state: { modelsDatastreams },
    } = useEditorContext();

    return (
        <List>
            {modelsDatastreams.map((datastream, index) => (
                <Datastream datastream={datastream} key={index} />
            ))}
        </List>
    );
};

export default DatastreamList;
