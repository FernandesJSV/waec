import { Chip, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useState } from "react";
import { i18n } from "../../translate/i18n";

export function StatusFilter({ onFiltered }) {
    const [status, setStatus] = useState([]);
    const [selecteds, setSelecteds] = useState([]);

    useEffect(() => {
        async function fetchData() {
            await loadStatus();
        }
        fetchData();
    }, []);

    const loadStatus = async () => {
        const data = [
            { id: "open", name: i18n.t("status.open"), color: "#f00" },
            { id: "closed", name: i18n.t("status.closed"), color: "#0f0" },
            { id: "pending", name: i18n.t("status.pending"), color: "#ff0" },
        ];
        setStatus(data);
    };

    const onChange = async (value) => {
        setSelecteds(value);
        onFiltered(value);
    };

    return (
        <Autocomplete
            multiple
            size="small"
            options={status}
            value={selecteds}
            onChange={(e, v, r) => onChange(v)}
            getOptionLabel={(option) => option.name}
            renderStatus={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip
                        variant="outlined"
                        style={{
                            backgroundColor: option.color || "#eee",
                            textShadow: "1px 1px 1px #000",
                            color: "white",
                        }}
                        label={option.name}
                        {...getTagProps({ index })}
                        size="small"
                    />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Status"
                />
            )}
        />
    );
}
