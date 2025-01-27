import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";
import TextField from "@mui/material/TextField";
import { useEditorContext } from "../../../context/EditorContext";

import ExpandCircleDown from "@mui/icons-material/ExpandCircleDown";
import IconButton from "@mui/material/IconButton";
import DatastreamAgentsContentNotes from "./DatastreamAgentsContentNotes";
import ButtonGroup from "@mui/material/ButtonGroup";
import Paper from "@mui/material/Paper";

interface DatastreamAgentsContentRowProps {
    agent: {
        role: string;
        type: string;
        name: string;
        notes: Array<string>;
    };
    additionalControls: React.ReactElement;
    initialExpand: boolean;
    namesHelperText: string;
    onRoleChange: (role: string) => void;
    onTypeChange: (type: string) => void;
    onNameChange: (name: string) => void;
    onNotesChange: (notes: Array<string>) => void;
}
const DatastreamAgentsContentRow = ({
    agent,
    additionalControls,
    initialExpand,
    namesHelperText = "",
    onRoleChange,
    onTypeChange,
    onNameChange,
    onNotesChange,
}: DatastreamAgentsContentRowProps): React.ReactElement => {
    const {
        state: { agentsCatalog },
    } = useEditorContext();
    const { types, roles, defaults } = agentsCatalog;
    const { role, type, name, notes } = agent;
    const [expanded, setExpanded] = useState(initialExpand);
    return (
        <>
            <Grid container item xs={3}>
                <Paper
                    variant="outlined"
                    sx={{ display: "flex", alignItems: "center", width: "100%", padding: "0 14px" }}
                >
                    <FormControl fullWidth={true}>
                        <NativeSelect
                            className="agentRoleSelect"
                            value={role}
                            error={role === ""}
                            onChange={(event) => onRoleChange(event.target.value)}
                        >
                            <option value=""></option>
                            {roles.map((role, index) => {
                                return (
                                    <option key={index} value={role}>
                                        {role}
                                    </option>
                                );
                            })}
                        </NativeSelect>
                    </FormControl>
                </Paper>
            </Grid>
            <Grid container item xs={3}>
                <Paper
                    variant="outlined"
                    sx={{ display: "flex", alignItems: "center", width: "100%", padding: "0 14px" }}
                >
                    <FormControl fullWidth={true}>
                        <NativeSelect
                            className="agentTypeSelect"
                            value={type}
                            error={type === ""}
                            onChange={(event) => onTypeChange(event.target.value)}
                        >
                            <option value=""></option>
                            {types.map((type, index) => {
                                return (
                                    <option key={index} value={type}>
                                        {type}
                                    </option>
                                );
                            })}
                        </NativeSelect>
                    </FormControl>
                </Paper>
            </Grid>
            <Grid container item xs={5}>
                <FormControl fullWidth={true}>
                    <TextField
                        className="agentNameTextField"
                        error={name === ""}
                        value={name}
                        label={namesHelperText}
                        onChange={(event) => {
                            const { role, type } = defaults;
                            if (agent.name === "" && agent.role === "") {
                                onRoleChange(role);
                            }
                            if (agent.name === "" && agent.type === "") {
                                onTypeChange(type);
                            }
                            onNameChange(event.target.value);
                        }}
                    />
                </FormControl>
            </Grid>
            <Grid container item xs={1}>
                <Paper variant="outlined" sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <FormControl fullWidth={true}>
                        <ButtonGroup sx={{ display: "flex", justifyContent: "center" }}>
                            <IconButton
                                onClick={() => {
                                    setExpanded(!expanded);
                                }}
                            >
                                <ExpandCircleDown />
                            </IconButton>
                            {additionalControls}
                        </ButtonGroup>
                    </FormControl>
                </Paper>
            </Grid>
            <DatastreamAgentsContentNotes
                expanded={expanded}
                notes={notes}
                setNotes={(notes) => onNotesChange(notes)}
            />
        </>
    );
};

export default DatastreamAgentsContentRow;
