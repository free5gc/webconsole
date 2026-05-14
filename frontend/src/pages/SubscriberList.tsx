import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../axios";
import { Subscriber } from "../api/api";

import Dashboard from "../Dashboard";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import { ReportProblemRounded } from "@mui/icons-material";
import {
  MultipleDeleteSubscriberData,
  formatMultipleDeleteSubscriberToJson,
} from "../lib/jsonFormating";

const BULK_DELETE_WARN_THRESHOLD = 100;
const BULK_DELETE_BATCH_SIZE = 500;

interface Props {
  refresh: boolean;
  setRefresh: (v: boolean) => void;
}

function SubscriberList(props: Props) {
  const navigation = useNavigate();
  const [data, setData] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoadError, setIsLoadError] = useState(false);
  const [isDeleteError, setIsDeleteError] = useState(false);
  const [selected, setSelected] = useState<MultipleDeleteSubscriberData[]>([]);
  const [deleteProgress, setDeleteProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("/api/subscriber")
      .then((res) => setData(res.data))
      .catch(() => setIsLoadError(true))
      .finally(() => setIsLoading(false));
  }, [props.refresh]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (s) =>
          s.ueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.plmnID?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data, searchTerm]
  );

  useEffect(() => {
    setSelected([]);
  }, [searchTerm]);

  const handleRowClick = useCallback((item: MultipleDeleteSubscriberData) => {
    setSelected((prev) => {
      const idx = prev.findIndex(
        (s) => s.ueId === item.ueId && s.plmnID === item.plmnID
      );
      if (idx === -1) return [...prev, item];
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }, []);

  const handleSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(
      e.target.checked
        ? filteredData.map((r) => ({ ueId: r.ueId!, plmnID: r.plmnID! }))
        : []
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const isSelected = (item: MultipleDeleteSubscriberData) =>
    selected.some((s) => s.ueId === item.ueId && s.plmnID === item.plmnID);

  const onDelete = useCallback(
    (id: string, plmn: string) => {
      if (!window.confirm("Delete subscriber?")) return;
      axios
        .delete("/api/subscriber/" + id + "/" + plmn)
        .then(() => props.setRefresh(!props.refresh))
        .catch((err) => {
          setIsDeleteError(true);
          console.error(err.response?.data?.message);
        });
    },
    [props]
  );

  const onModify = useCallback(
    (s: Subscriber) => navigation("/subscriber/" + s.ueId + "/" + s.plmnID),
    [navigation]
  );

  const onEdit = useCallback(
    (s: Subscriber) =>
      navigation("/subscriber/create/" + s.ueId + "/" + s.plmnID),
    [navigation]
  );

  const onDeleteSelected = async () => {
    const count = selected.length;
    if (count === 0) return;

    const preview = selected
      .slice(0, 5)
      .map((i) => `  • ${i.ueId} (PLMN: ${i.plmnID})`)
      .join("\n");
    const more = count > 5 ? `\n  ...and ${count - 5} more` : "";

    const firstMsg =
      count >= BULK_DELETE_WARN_THRESHOLD
        ? `WARNING: You are about to delete ${count} subscribers.\n\nPreview:\n${preview}${more}\n\nClick OK to continue.`
        : `Delete ${count} subscriber(s)?\n\nPreview:\n${preview}${more}`;

    if (!window.confirm(firstMsg)) return;

    if (
      count >= BULK_DELETE_WARN_THRESHOLD &&
      !window.confirm(
        `Final confirmation: permanently delete ${count} subscribers?\n\nThis cannot be undone.`
      )
    )
      return;

    const items = formatMultipleDeleteSubscriberToJson(selected);
    console.log(`[BulkDelete] Starting: ${items.length} subscribers, batch size ${BULK_DELETE_BATCH_SIZE}`);

    setDeleteProgress({ current: 0, total: items.length });
    let completed = 0;
    let anyError = false;

    for (let start = 0; start < items.length; start += BULK_DELETE_BATCH_SIZE) {
      const batch = items.slice(start, start + BULK_DELETE_BATCH_SIZE);
      try {
        await axios.delete("/api/subscriber", { data: batch });
        console.log(`[BulkDelete] Batch ${start}–${start + batch.length - 1}: OK`);
      } catch (err: any) {
        anyError = true;
        console.error(
          `[BulkDelete] Batch ${start}–${start + batch.length - 1} failed:`,
          err.response?.status,
          err.response?.data ?? err.message
        );
      }
      completed += batch.length;
      setDeleteProgress({ current: completed, total: items.length });
    }

    setDeleteProgress(null);

    if (anyError) {
      setIsDeleteError(true);
    }
    props.setRefresh(!props.refresh);
    setSelected([]);
  };

  if (isLoadError) {
    return (
      <Stack sx={{ mx: "auto", py: "2rem" }} spacing={2} alignItems="center">
        <ReportProblemRounded sx={{ fontSize: "3rem" }} />
        <Box fontWeight={700}>Something went wrong</Box>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <Stack sx={{ mx: "auto", py: "4rem" }} alignItems="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (data == null || data.length === 0) {
    return (
      <>
        <br />
        <div>
          No Subscription
          <br /><br />
          <Grid item xs={12}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => navigation("/subscriber/create")}
              sx={{ m: 1 }}
            >
              CREATE
            </Button>
          </Grid>
        </div>
      </>
    );
  }

  return (
    <>
      <br />
      <TextField
        label={`Search Subscriber (${filteredData.length} / ${data.length})`}
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />

      {(selected.length > 0 || deleteProgress !== null) && (
        <Box sx={{ mb: 1 }}>
          <Button
            color="error"
            variant="contained"
            onClick={onDeleteSelected}
            disabled={deleteProgress !== null}
          >
            {deleteProgress !== null
              ? `Deleting… ${deleteProgress.current} / ${deleteProgress.total}`
              : `Delete Selected (${selected.length})`}
          </Button>
          {deleteProgress !== null && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                color="error"
                value={Math.round((deleteProgress.current / deleteProgress.total) * 100)}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round((deleteProgress.current / deleteProgress.total) * 100)}% complete
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={selected.length > 0 && selected.length < filteredData.length}
                checked={filteredData.length > 0 && selected.length === filteredData.length}
                onChange={handleSelectAllClick}
              />
            </TableCell>
            <TableCell>PLMN</TableCell>
            <TableCell>UE ID</TableCell>
            <TableCell>Delete</TableCell>
            <TableCell>View</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((row, index) => {
            const item = { ueId: row.ueId!, plmnID: row.plmnID! };
            const isItemSelected = isSelected(item);

            return (
              <TableRow
                key={index}
                hover
                onClick={() => handleRowClick(item)}
                role="checkbox"
                aria-checked={isItemSelected}
                selected={isItemSelected}
              >
                <TableCell padding="checkbox">
                  <Checkbox color="primary" checked={isItemSelected} />
                </TableCell>
                <TableCell>{row.plmnID}</TableCell>
                <TableCell>{row.ueId}</TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(row.ueId!, row.plmnID!);
                    }}
                  >
                    DELETE
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      onModify(row);
                    }}
                  >
                    VIEW
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row);
                    }}
                  >
                    EDIT
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Grid item xs={12} sx={{ mt: 1 }}>
        <Button
          color="primary"
          variant="contained"
          onClick={() => navigation("/subscriber/create")}
          sx={{ m: 1 }}
        >
          CREATE
        </Button>
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={isDeleteError}
        autoHideDuration={6000}
        onClose={() => setIsDeleteError(false)}
      >
        <Alert severity="error">Failed to delete subscriber</Alert>
      </Snackbar>
    </>
  );
}

function WithDashboard(Component: React.ComponentType<any>) {
  return function (props: any) {
    const [refresh, setRefresh] = useState<boolean>(false);
    return (
      <Dashboard
        title="SUBSCRIBER"
        refreshAction={() => setRefresh(!refresh)}
      >
        <Component
          {...props}
          refresh={refresh}
          setRefresh={(v: boolean) => setRefresh(v)}
        />
      </Dashboard>
    );
  };
}

export default WithDashboard(SubscriberList);
