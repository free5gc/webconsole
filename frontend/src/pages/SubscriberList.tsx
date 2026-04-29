import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import { List } from "react-window";

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
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import { ReportProblemRounded } from "@mui/icons-material";
import {
  MultipleDeleteSubscriberData,
  formatMultipleDeleteSubscriberToJson,
} from "../lib/jsonFormating";

// ── constants ────────────────────────────────────────────────────────────────

const ROW_HEIGHT = 52;
const MAX_LIST_HEIGHT = 530;
const BULK_DELETE_WARN_THRESHOLD = 100;
const BULK_DELETE_BATCH_SIZE = 100;

// Column widths shared between header and virtual rows.
// Must stay in sync — change both together.
const COL_CHECKBOX = "52px";
const COL_PLMN     = "18%";
const COL_UEID     = "1fr";
const COL_DELETE   = "110px";
const COL_VIEW     = "90px";
const COL_EDIT     = "90px";
const GRID_COLS    = `${COL_CHECKBOX} ${COL_PLMN} ${COL_UEID} ${COL_DELETE} ${COL_VIEW} ${COL_EDIT}`;

// ── types ────────────────────────────────────────────────────────────────────

interface Props {
  refresh: boolean;
  setRefresh: (v: boolean) => void;
}

type RowSharedProps = {
  rows: Subscriber[];
  selected: MultipleDeleteSubscriberData[];
  onDelete: (id: string, plmn: string) => void;
  onModify: (s: Subscriber) => void;
  onEdit: (s: Subscriber) => void;
  onRowClick: (item: MultipleDeleteSubscriberData) => void;
};

// ── virtual row ──────────────────────────────────────────────────────────────
// Defined outside SubscriberList so its reference is stable across renders.

type VirtualRowProps = {
  ariaAttributes: Record<string, string | number>;
  index: number;
  style: CSSProperties;
} & RowSharedProps;

function VirtualRow({
  index,
  style,
  rows,
  selected,
  onDelete,
  onModify,
  onEdit,
  onRowClick,
}: VirtualRowProps) {
  const row = rows[index];
  if (!row) return null;

  const item: MultipleDeleteSubscriberData = {
    ueId: row.ueId!,
    plmnID: row.plmnID!,
  };

  // Selection keyed by stable ueId+plmnID — survives scroll and search changes
  const isItemSelected = selected.some(
    (s) => s.ueId === item.ueId && s.plmnID === item.plmnID
  );

  return (
    <Box
      style={style}
      onClick={() => onRowClick(item)}
      sx={{
        display: "grid",
        gridTemplateColumns: GRID_COLS,
        alignItems: "center",
        borderBottom: "1px solid rgba(224,224,224,1)",
        backgroundColor: isItemSelected
          ? "rgba(25,118,210,0.08)"
          : "transparent",
        "&:hover": { backgroundColor: isItemSelected ? "rgba(25,118,210,0.12)" : "rgba(0,0,0,0.04)" },
        cursor: "pointer",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Checkbox color="primary" checked={isItemSelected} size="small" />
      </Box>
      <Box sx={{ px: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14 }}>
        {row.plmnID}
      </Box>
      <Box sx={{ px: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14 }}>
        {row.ueId}
      </Box>
      <Box sx={{ px: 0.5 }}>
        <Button
          size="small"
          color="primary"
          variant="contained"
          onClick={(e) => { e.stopPropagation(); onDelete(row.ueId!, row.plmnID!); }}
        >
          DELETE
        </Button>
      </Box>
      <Box sx={{ px: 0.5 }}>
        <Button
          size="small"
          color="primary"
          variant="contained"
          onClick={(e) => { e.stopPropagation(); onModify(row); }}
        >
          VIEW
        </Button>
      </Box>
      <Box sx={{ px: 0.5 }}>
        <Button
          size="small"
          color="primary"
          variant="contained"
          onClick={(e) => { e.stopPropagation(); onEdit(row); }}
        >
          EDIT
        </Button>
      </Box>
    </Box>
  );
}

// ── component ────────────────────────────────────────────────────────────────

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

  // useMemo: filter only reruns when data or searchTerm changes,
  // not on every checkbox tick
  const filteredData = useMemo(
    () =>
      data.filter(
        (s) =>
          s.ueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.plmnID?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data, searchTerm]
  );

  // Clear selection when search changes to avoid acting on hidden items
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

  // Batched bulk delete — sends BULK_DELETE_BATCH_SIZE subscribers per request
  // so large selections (e.g. 50 K) don't produce a single giant payload that
  // the browser or server silently drops.
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
    console.log(`[BulkDelete] Done. anyError=${anyError}`);

    if (anyError) {
      setIsDeleteError(true);
    }
    // Always refresh and clear — partial deletes should still update the list
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

  // ── Virtual list setup ───────────────────────────────────────────────────
  // The List is placed in a plain Box div — NOT inside MUI TableBody.
  // This ensures react-window can correctly measure its container height
  // via ResizeObserver and render only visible rows (~10 at a time).
  //
  // Column alignment is achieved with CSS Grid using the same GRID_COLS
  // constant for both the header and each virtual row.

  const listHeight = Math.min(filteredData.length * ROW_HEIGHT, MAX_LIST_HEIGHT);

  const rowProps: RowSharedProps = {
    rows: filteredData,
    selected,
    onDelete,
    onModify,
    onEdit,
    onRowClick: handleRowClick,
  };

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

      {/* Header — plain Table with matching CSS Grid column widths */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: GRID_COLS,
          alignItems: "center",
          borderBottom: "2px solid rgba(224,224,224,1)",
          borderTop: "1px solid rgba(224,224,224,1)",
          borderLeft: "1px solid rgba(224,224,224,1)",
          borderRight: "1px solid rgba(224,224,224,1)",
          backgroundColor: "#fafafa",
          fontWeight: 600,
          fontSize: 14,
          minHeight: ROW_HEIGHT,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Checkbox
            color="primary"
            indeterminate={selected.length > 0 && selected.length < filteredData.length}
            checked={filteredData.length > 0 && selected.length === filteredData.length}
            onChange={handleSelectAllClick}
            size="small"
          />
        </Box>
        <Box sx={{ px: 1 }}>PLMN</Box>
        <Box sx={{ px: 1 }}>UE ID</Box>
        <Box sx={{ px: 0.5 }}>Delete</Box>
        <Box sx={{ px: 0.5 }}>View</Box>
        <Box sx={{ px: 0.5 }}>Edit</Box>
      </Box>

      {/* Virtual body — react-window List with explicit pixel height.
          Must use pixels not "100%" — react-window v2 uses ResizeObserver
          which cannot resolve percentage heights, resulting in 0 rows rendered. */}
      <Box sx={{ border: "1px solid rgba(224,224,224,1)", borderTop: 0 }}>
        <List<RowSharedProps>
          rowComponent={VirtualRow}
          rowProps={rowProps}
          rowCount={filteredData.length}
          rowHeight={ROW_HEIGHT}
          style={{ height: listHeight, width: "100%" }}
        />
      </Box>

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
