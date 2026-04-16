import { useState } from 'react';
import ConsentPage from './ConsentPage';
import PatientPickerPage from './PatientPickerPage';

const consentProps = window.__CONSENT_PROPS__;
const urlParams = new URLSearchParams(window.location.search);
// const isPatientPickerRoute = urlParams.get('page') === 'patient-picker';

function readStoredPatient() {
  const stored = sessionStorage.getItem("selectedPatient");
  if (!stored) return null;
  sessionStorage.removeItem("selectedPatient");
  try { return JSON.parse(stored); } catch { return null; }
}

export default function App() {
  const [selectedPatient, setSelectedPatient] = useState(readStoredPatient);

  if (!selectedPatient) {
    return (
      <PatientPickerPage
        {...(consentProps ?? {})}
        onProceed={(patient) => setSelectedPatient(patient)}
      />
    );
  }

  if (!consentProps) {
    return (
      <div style={{ fontFamily: 'monospace', padding: '2rem', color: '#d32f2f' }}>
        <strong>Missing consent props.</strong> This page must be served by the Ballerina consent service.
      </div>
    );
  }

  const additionalContext = selectedPatient ? [JSON.stringify(selectedPatient)] : [];
  return <ConsentPage {...consentProps} additionalContext={additionalContext} />;
}
