import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../constants/config";
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
    TablePagination,
    TableRow,
    TextField,
} from "@mui/material";

export default function ProfileList() {
    const navigation = useNavigate();
    const [refresh, setRefresh] = useState<boolean>(false);
    const [data, setData] = useState<Profile[]>([]);
    const [limit, setLimit] = useState(50);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        axios
            .get("/api/profile")
            .then((res) => {
                setData(res.data);
            })
            .catch((e) => {
                alert(e.message);
            });
    }, [refresh, limit, page]);

    const handlePageChange = (
        _event: React.MouseEvent<HTMLButtonElement> | null,
        newPage?: number,
    ) => {
        if (newPage !== null) {
            setPage(newPage!);
        }
    };

    const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLimit(Number(event.target.value));
    };
    
    const count = () => {
        return 0;
    };
    
    const pager = () => {
        if (config.enablePagination) {
            return (
                <TablePagination
                    component="div"
                    count={count()}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleLimitChange}
                    page={page}
                    rowsPerPage={limit}
                    rowsPerPageOptions={[50, 100, 200]}
                />
            );
        } else {
            return <br />;
        }
    };

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
                setRefresh(!refresh);
            })
            .catch((err) => {
                alert(err.response.data.message);
            });
    };

    const handleModify = (profile: Profile) => {
        navigation("/profile/" + profile.profileName);
    };

    const filteredData = data.filter((profile) =>
        profile.profileName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const tableView = (
        <React.Fragment>
            <TextField
                label="Search Profile"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                fullWidth
                margin="normal"
            />
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Delete</TableCell>
                        <TableCell>View</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredData.map((row, index) => (
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
            {pager()}
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
