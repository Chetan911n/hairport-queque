/**
 * BACKUP & DATA PROTECTION SERVICE
 * 
 * Provides:
 * 1. Manual JSON export/import of clients, visits, and tickets.
 * 2. Complete Google Cloud Platform (GCP) Automated Backup Architecture setup documentation.
 */

export const exportCompleteSalonBackup = (data: {
  tickets: any[];
  clients?: any[];
  visits?: any[];
}): void => {
  const backupPayload = {
    exportDate: new Date().toISOString(),
    version: "2.0.0",
    tickets: data.tickets || [],
    clients: data.clients || [],
    visits: data.visits || []
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `pn_hairport_full_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const GCP_AUTOMATED_BACKUP_GUIDE = `
# AUTOMATED FIRESTORE BACKUP SETUP GUIDE (GCP)

To enable true automated daily backups of your Firestore database to Google Cloud Storage:

### Step 1: Create a Dedicated GCS Bucket
Run in Google Cloud Shell or Terminal:
\`\`\`bash
gcloud storage buckets create gs://hairport-firestore-backups --location=asia-south1 --uniform-bucket-level-access
\`\`\`

### Step 2: Set Object Retention Lifecycle (30 Days)
Create a lifecycle configuration file \`lifecycle.json\`:
\`\`\`json
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {"age": 30}
    }
  ]
}
\`\`\`
Apply lifecycle rule:
\`\`\`bash
gcloud storage buckets update gs://hairport-firestore-backups --lifecycle-file=lifecycle.json
\`\`\`

### Step 3: Configure Automated Daily Schedule (Cloud Scheduler)
Enable Cloud Scheduler and trigger daily Firestore export at 3:00 AM IST:
\`\`\`bash
gcloud scheduler jobs create http firestore-daily-backup \\
  --schedule="0 3 * * *" \\
  --time-zone="Asia/Kolkata" \\
  --uri="https://firestore.googleapis.com/v1/projects/hairport-queue/databases/(default):exportDocuments" \\
  --http-method=POST \\
  --message-body='{"outputUriPrefix": "gs://hairport-firestore-backups/daily"}' \\
  --oauth-service-account-email="hairport-queue@appspot.gserviceaccount.com"
\`\`\`

### Step 4: Verification & Restore Command
To restore from a backup point:
\`\`\`bash
gcloud firestore import gs://hairport-firestore-backups/daily/[TIMESTAMP]
\`\`\`
`;
