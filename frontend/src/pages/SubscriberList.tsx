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
  Grid,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
} from "@mui/material";
import { ReportProblemRounded } from "@mui/icons-material";
import {
  MultipleDeleteSubscriberData,
  formatMultipleDeleteSubscriberToJson,
} from "../lib/jsonFormating";

// ── constants ────────────────────────────────────────────────────────────────

const ROW_HEIGHT = 53;
const MAX_LIST_HEIGHT = 530; // ~10 rows visible at once
const BULK_DELETE_WARN_THRESHOLD = 100;

// ── types ────────────────────────────────────────────────────────────────────

interface Props {
  refresh: boolean;
  setRefresh: (v: boolean) => void;
}

// Shared data passed to every virtual row via react-window v2 rowProps
type RowSharedProps = {
  rows: Subscriber[];
  selected: MultipleDeleteSubscriberData[];
  onDelete: (id: string, plmn: string) => void;
  onModify: (s: Subscriber) => void;
  onEdit: (s: Subscriber) => void;
  onRowClick: (item: MultipleDeleteSubscriberData) => void;
};

// ── virtual row component ────────────────────────────────────────────────────
// Defined outside SubscriberList so its reference is stable and react-window
// does not remount every visible row on each parent render.

type VirtualRowProps = {
  ariaAttributes: Record<string, string>;
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

  // Point 5: selection keyed by stable ueId+plmnID — not tied to index or
  // current scroll position, so selections survive scroll and search changes.
  const isItemSelected = selected.some(
    (s) => s.ueId === item.ueId && s.plmnID === item.plmnID
  );

  return (
    <TableRow
      style={{
        ...style,
        // Keep react-window absolute positioning while restoring table layout
        // so cells align with the fixed TableHead columns.
        display: "table",
        width: "100%",
        tableLayout: "fixed",
        boxSizing: "border-box",
      }}
      hover
      selected={isItemSelected}
      onClick={() => onRowClick(item)}
      role="checkbox"
      aria-checked={isItemSelected}
    >
      <TableCell padding="checkbox">
        <Checkbox color="primary" checked={isItemSelected} />
      </TableCell>
      <TableCell>{row.plmnID}</TableCell>
      <TableCell>{row.ueId}</TableCell>
      <TableCell>
        <Button
          size="small"
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
          size="small"
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
          size="small"
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
}

// ── main component ───────────────────────────────────────────────────────────

function SubscriberList(props: Props) {
  const navigation = useNavigate();
  const [data, setData] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoadError, setIsLoadError] = useState(false);
  const [isDeleteError, setIsDeleteError] = useState(false);

  // Point 5: selection stored globally by stable ID, independent of scroll
  // position or current visible page — deletions work correctly across the
  // full dataset.
  const [selected, setSelected] = useState<MultipleDeleteSubscriberData[]>([]);

  useEffect(() => {
    axios
      .get("/api/subscriber")
      .then((res) => setData(res.data))
      .catch(() => setIsLoadError(true));
  }, [props.refresh]);

  // Point 2: memoize filtering — only reruns when data or searchTerm changes,
  // not on every checkbox tick or button hover. With 10K rows, this eliminates
  // a full array scan on every unrelated render.
  const filteredData = useMemo(
    () =>
      data.filter(
        (s) =>
          s.ueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.plmnID?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data, searchTerm]
  );

  // Point 4: clear selection when search changes — avoids deleting subscribers
  // that are no longer visible in the filtered result set.
  useEffect(() => {
    setSelected([]);
  }, [searchTerm]);

  // Point 5: row click toggles selection by stable ueId+plmnID key, not index.
  const handleRowClick = useCallback(
    (item: MultipleDeleteSubscriberData) => {
      setSelected((prev) => {
        const idx = prev.findIndex(
          (s) => s.ueId === item.ueId && s.plmnID === item.plmnID
        );
        if (idx === -1) return [...prev, item];
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });
    },
    []
  );

  const handleSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(
      e.target.checked
        ? filteredData.map((r) => ({ ueId: r.ueId!, plmnID: r.plmnID! }))
        : []
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Point 4: no explicit page reset needed — virtualization always renders
    // from the top of filteredData when the reference changes.
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
    (s: Subscriber) =>
      navigation("/subscriber/" + s.ueId + "/" + s.plmnID),
    [navigation]
  );

  const onEdit = useCallback(
    (s: Subscriber) =>
      navigation("/subscriber/create/" + s.ueId + "/" + s.plmnID),
    [navigation]
  );

  // Point 3: threshold-based confirmation.
  // < THRESHOLD  → single confirm with count + 5-item preview
  // ≥ THRESHOLD  → double confirm: first warning, then final irreversible step
  const onDeleteSelected = () => {
    const count = selected.length;
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
    ) {
      return;
    }

    axios
      .delete("/api/subscriber", {
        data: formatMultipleDeleteSubscriberToJson(selected),
      })
      .then(() => {
        props.setRefresh(!props.refresh);
        setSelected([]);
      })
      .catch((err) => {
        setIsDeleteError(true);
        console.log(err.response?.data?.message);
      });
  };

  if (isLoadError) {
    return (
      <Stack sx={{ mx: "auto", py: "2rem" }} spacing={2} alignItems="center">
        <ReportProblemRounded sx={{ fontSize: "3rem" }} />
        <Box fontWeight={700}>Something went wrong</Box>
      </Stack>
    );
  }

  if (data == null || data.length === 0) {
    return (
      <>
        <br />
        <div>
          No Subscription
          <br />
          <br />
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

  // Point 1: react-window FixedSizeList (v2 API: `List`) — only visible rows
  // exist in the DOM regardless of dataset size or search result count.
  // DOM node count stays bounded to ~(MAX_LIST_HEIGHT / ROW_HEIGHT) ≈ 10 rows.
  //
  // Column alignment: TableHead uses display:table + table-layout:fixed at
  // 100% width. Each VirtualRow applies the same styles so columns align
  // without needing a <colgroup>.
  const listHeight = Math.min(filteredData.length * ROW_HEIGHT, MAX_LIST_HEIGHT);

  // rowProps is shared across all rows — stable references via useCallback
  // ensure react-window does not needlessly remount visible rows.
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
      {selected.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button color="error" variant="contained" onClick={onDeleteSelected}>
            Delete Selected ({selected.length})
          </Button>
        </Box>
      )}
      <Table
        sx={{
          tableLayout: "fixed",
          "& thead": {
            display: "table",
            width: "100%",
            tableLayout: "fixed",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={
                  selected.length > 0 &&
                  selected.length < filteredData.length
                }
                checked={
                  filteredData.length > 0 &&
                  selected.length === filteredData.length
                }
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
        {/* display:block allows react-window to manage overflow/scroll */}
        <TableBody sx={{ display: "block" }}>
          <List<RowSharedProps>
            rowComponent={VirtualRow}
            rowProps={rowProps}
            rowCount={filteredData.length}
            rowHeight={ROW_HEIGHT}
            style={{ height: listHeight, width: "100%" }}
          />
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
