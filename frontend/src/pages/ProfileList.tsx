import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../Dashboard";
import axios from "../axios";
import { Profile } from "../api/api";
import {
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";

export default function ProfileList() {
    const navigation = useNavigate();
    const [refresh, setRefresh] = useState<boolean>(false);
    const [data, setData] = useState<Profile[]>([]);
    const [limit, setLimit] = useState(50);
    const [page, setPage] = useState(0);

    useEffect(() => {
        console.log("get profiles");
        axios
            .get("/api/profile")
            .then((res) => {
                setData(res.data);
            })
            .catch((e) => {
                console.log(e.message);
            });
        // set data to empty array
        // setData([]);
    }, [refresh, limit, page]);

    const onCreate = () => {
        navigation("/profile/create");
    };

    const onDelete = (profileName: string) => {
        const result = window.confirm("Delete profile?");
        if (!result) {
            return;
        }
        axios
            .delete("/api/profile/" + profileName)
            .then((res) => {
                console.log(res);
                setRefresh(!refresh);
            })
            .catch((err) => {
                console.log(err.response.data.message);
            });
    };

    const handleModify = (profile: Profile) => {
        navigation("/profile/" + profile.profileName);
    };

    const tableView = (
        <React.Fragment>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Delete</TableCell>
                        <TableCell>View</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{row.profileName}</TableCell>
                            <TableCell>
                                <Button color="primary" variant="contained" onClick={() => onDelete(row.profileName)}>
                                    DELETE
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button color="primary" variant="contained" onClick={() => handleModify(row)}>
                                    VIEW
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Grid item xs={12}>
                <Button color="primary" variant="contained" onClick={() => onCreate()} sx={{ m: 1 }}>
                    CREATE
                </Button>
            </Grid>
        </React.Fragment>
    );

    return (
        <Dashboard title="PROFILE" refreshAction={() => setRefresh(!refresh)}>
            <br />
            {data.length === 0 ? (
                <div>
                    No Profiles
                    <br />
                    <br />
                    <Grid item xs={12}>
                        <Button color="primary" variant="contained" onClick={() => onCreate()} sx={{ m: 1 }}>
                            CREATE
                        </Button>
                    </Grid>
                </div>
            ) : (
                tableView
            )}
        </Dashboard>
    );
}
