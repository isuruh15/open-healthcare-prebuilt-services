import { useState, useEffect } from "react";
import AppBar from "@oxygen-ui/react/AppBar";
import Avatar from "@oxygen-ui/react/Avatar";
import Box from "@oxygen-ui/react/Box";
import Button from "@oxygen-ui/react/Button";
import Card from "@oxygen-ui/react/Card";
import CardContent from "@oxygen-ui/react/CardContent";
import Chip from "@oxygen-ui/react/Chip";
import CircularProgress from "@oxygen-ui/react/CircularProgress";
import Divider from "@oxygen-ui/react/Divider";
import FormControl from "@oxygen-ui/react/FormControl";
import MenuItem from "@oxygen-ui/react/MenuItem";
import Select from "@oxygen-ui/react/Select";
import Toolbar from "@oxygen-ui/react/Toolbar";
import Typography from "@oxygen-ui/react/Typography";

// ─── Development dummy data ───────────────────────────────────────────────────
const DUMMY_USER = {
  username: "jane.smith",
  displayName: "Jane Smith",
  email: "jane.smith@clinic.example.com",
  roles: ["practitioner"],
};

const DUMMY_PATIENTS = [
  {
    id: "patient-001",
    name: "Alice Johnson",
    dob: "1985-03-15",
    gender: "Female",
    mrn: "MRN-10012",
    phone: "+1 (555) 012-3456",
    address: "123 Maple Street, Springfield, IL 62701",
    bloodType: "O+",
  },
  {
    id: "patient-002",
    name: "Bob Martinez",
    dob: "1972-07-22",
    gender: "Male",
    mrn: "MRN-10047",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Avenue, Shelbyville, IL 62565",
    bloodType: "A-",
  },
  {
    id: "patient-003",
    name: "Carol White",
    dob: "1990-11-08",
    gender: "Female",
    mrn: "MRN-10093",
    phone: "+1 (555) 246-8013",
    address: "789 Pine Road, Capital City, IL 62703",
    bloodType: "B+",
  },
  {
    id: "patient-004",
    name: "David Chen",
    dob: "1968-01-30",
    gender: "Male",
    mrn: "MRN-10128",
    phone: "+1 (555) 135-7924",
    address: "321 Elm Boulevard, Ogdenville, IL 62571",
    bloodType: "AB+",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDob(dob) {
  if (!dob) return "—";
  const d = new Date(dob);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Wso2Logo() {
  return (
    <img
      src="https://wso2.cachefly.net/wso2/sites/all/image_resources/logos/WSO2-Logo-Black.webp"
      alt="WSO2"
      style={{ height: "28px", display: "block" }}
    />
  );
}

function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mb: 1 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          minWidth: 90,
          pt: "2px",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

// ─── PatientPickerPage ────────────────────────────────────────────────────────
export default function PatientPickerPage({ onProceed, onCancel, sessionDataKeyConsent, spId }) {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/me")
        .then((r) => {
          if (!r.ok) throw new Error("user fetch failed");
          return r.json();
        })
        .catch(() => DUMMY_USER),
      fetch("/api/patients")
        .then((r) => {
          if (!r.ok) throw new Error("patients fetch failed");
          return r.json();
        })
        .catch(() => DUMMY_PATIENTS),
    ])
      .then(([userData, patientsData]) => {
        setUser(userData);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedId) ?? null;

  const handleProceed = () => {
    if (onProceed) {
      onProceed(selectedPatient);
      return;
    }
    if (selectedPatient) {
      sessionStorage.setItem("selectedPatient", JSON.stringify(selectedPatient));
    }
    const params = new URLSearchParams();
    if (sessionDataKeyConsent) params.set("sessionDataKeyConsent", sessionDataKeyConsent);
    if (spId) params.set("spId", spId);
    window.location.href = "/consent?" + params.toString();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    window.history.back();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
        fontFamily: "'Nunito Sans', 'Segoe UI', Helvetica, Arial, sans-serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
          color: "inherit",
        }}
      >
        <Toolbar sx={{ gap: 1.5, px: { xs: 2, sm: 4 } }}>
          <Wso2Logo />
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 400,
              letterSpacing: "0.04em",
              color: "#1a1a2e",
              flexGrow: 1,
            }}
          >
            OPEN HEALTHCARE
          </Typography>

          {/* Logged-in user info */}
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "13px",
                  bgcolor: "#3B3B8F",
                  fontWeight: 700,
                }}
              >
                {getInitials(user.displayName || user.username)}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a2e", lineHeight: 1.2 }}>
                  {user.displayName || user.username}
                </Typography>
                {user.email && (
                  <Typography variant="caption" sx={{ color: "#5a5a72" }}>
                    {user.email}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: { xs: 2, sm: "40px 16px 60px" },
        }}
      >
        <Card
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 560,
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: "36px 40px 32px" } }}>
            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#1a1a2e",
                letterSpacing: "-0.02em",
                mb: 0.5,
              }}
            >
              Select Patient
            </Typography>
            <Typography variant="body2" sx={{ color: "#5a5a72", mb: 3 }}>
              Choose the patient record you want to associate with this session.
            </Typography>

            {/* Meta badges */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {user && (
                <Chip
                  label={`Practitioner: ${user.displayName || user.username}`}
                  size="small"
                  sx={{
                    bgcolor: "#eeeeff",
                    color: "#3B3B8F",
                    fontWeight: 600,
                    fontSize: "11px",
                    letterSpacing: "0.03em",
                  }}
                />
              )}
              <Chip
                label={`${patients.length} patient${patients.length !== 1 ? "s" : ""} available`}
                size="small"
                sx={{
                  bgcolor: "#f0faf0",
                  color: "#2e7d32",
                  fontWeight: 600,
                  fontSize: "11px",
                }}
              />
            </Box>

            {/* Loading / error states */}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={36} sx={{ color: "#3B3B8F" }} />
              </Box>
            )}

            {!loading && error && (
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: "#fff5f5",
                  border: "1px solid #ffcdd2",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                  Could not load data — showing sample records. ({error})
                </Typography>
              </Box>
            )}

            {/* Patient dropdown */}
            {!loading && (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#9090a8",
                    display: "block",
                    mb: 1,
                  }}
                >
                  Patient
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <Select
                    labelId="patient-select-label"
                    value={selectedId}
                    displayEmpty
                    renderValue={(value) =>
                      value
                        ? patients.find((p) => p.id === value)?.name ?? value
                        : <span style={{ color: "rgba(0,0,0,0.42)" }}>Choose a patient…</span>
                    }
                    onChange={(e) => setSelectedId(e.target.value)}
                    sx={{ borderRadius: "8px" }}
                  >
                    {patients.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: "11px",
                              bgcolor: "#3B3B8F",
                              fontWeight: 700,
                            }}
                          >
                            {getInitials(p.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {p.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#5a5a72" }}>
                              {p.mrn} · {p.gender} · Age {calcAge(p.dob)}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selected patient details card */}
                {selectedPatient && (
                  <Box
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      bgcolor: "#f8f8fc",
                      p: 2,
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          fontSize: "18px",
                          bgcolor: "#3B3B8F",
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(selectedPatient.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                          {selectedPatient.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#5a5a72" }}>
                          {selectedPatient.mrn}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    <DetailRow
                      label="Date of Birth"
                      value={`${formatDob(selectedPatient.dob)} (Age ${calcAge(selectedPatient.dob)})`}
                    />
                    <DetailRow label="Gender" value={selectedPatient.gender} />
                    {selectedPatient.bloodType && (
                      <DetailRow label="Blood Type" value={selectedPatient.bloodType} />
                    )}
                    {selectedPatient.phone && (
                      <DetailRow label="Phone" value={selectedPatient.phone} />
                    )}
                    {selectedPatient.address && (
                      <DetailRow label="Address" value={selectedPatient.address} />
                    )}
                  </Box>
                )}

                <Divider sx={{ mb: 3 }} />

                {/* Action buttons */}
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!selectedPatient}
                    onClick={handleProceed}
                    sx={{
                      bgcolor: "#3B3B8F",
                      fontWeight: 700,
                      fontSize: "15px",
                      py: 1.5,
                      borderRadius: "8px",
                      letterSpacing: "0.01em",
                      textTransform: "none",
                      "&:hover": { bgcolor: "#2d2d7a" },
                      "&.Mui-disabled": {
                        bgcolor: "#c5c5e0",
                        color: "#ffffff",
                      },
                    }}
                  >
                    Proceed
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{
                      color: "#d32f2f",
                      borderColor: "#d32f2f",
                      fontWeight: 600,
                      fontSize: "15px",
                      py: 1.5,
                      px: 3,
                      borderRadius: "8px",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#fff5f5",
                        borderColor: "#d32f2f",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <Box
        component="footer"
        sx={{
          textAlign: "center",
          py: 2,
          px: 2,
          fontSize: "12px",
          color: "#9090a8",
          borderTop: "1px solid #e0e0e0",
          bgcolor: "#ffffff",
        }}
      >
        <Typography variant="captio
        n" sx={{ color: "#9090a8" }}>
          WSO2 Healthcare | © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
}
