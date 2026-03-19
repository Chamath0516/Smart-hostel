import { QRCodeCanvas } from "qrcode.react";
import DashboardLayout from "../components/DashboardLayout";

const QrGeneratorPage = () => {
  const qrUrl = `${window.location.origin}/qr`;

  return (
    <DashboardLayout title="Gate QR">
      <section className="dashboard-card dashboard-center-card">
        <h2>Hostel Gate QR Code</h2>
        <p className="dashboard-small-text">Students scan this at the gate</p>
        <QRCodeCanvas value={qrUrl} size={220} />
        <p className="dashboard-small-text dashboard-break-all">{qrUrl}</p>
      </section>
    </DashboardLayout>
  );
};

export default QrGeneratorPage;
