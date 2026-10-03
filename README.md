# Aqua Nova Studio — Operations Hub V2

Static frontend for GitHub Pages with Firebase Auth + Firestore/RTDB and Google Drive link-only deliverables.

## V2 security model
- Reserved bootstrap Root: `root@ana.studio`.
- No public registration UI.
- Only the bootstrap Root gets User Management.
- Account provisioning uses the included Firebase callable function `provisionUser`; this uses Firebase Admin SDK so creating a user does not replace the Root browser session.
- Roles available for provisioned accounts: Admin, Staff, Vendor, Talent. Root is intentionally not an option.

## Project offer flow
Agency project creation requires Internal PIC + Vendor + exact Vendor User/Worker. New projects start as `Awaiting Acceptance`. Only the assigned worker receives the offer. They can Accept or Reject; rejection requires a reason and is preserved in the project/audit trail. After acceptance the project becomes `Planned` and follows the production lifecycle.

## Deploy
1. Create/verify Firebase Auth user `root@ana.studio` manually once.
2. Create Firestore `users/{ROOT_UID}` with: `displayName`, `email: root@ana.studio`, `role: root`, `permissions: []`, `status: active`.
3. Enable Email/Password Auth, Firestore and RTDB.
4. Deploy `firestore.rules` and `database.rules.json`.
5. Deploy the callable function. This repository keeps `functions.js` + `package.json` at root for portability; put them in your Firebase Functions source folder (normally `functions/index.js` and `functions/package.json`) and run Firebase CLI deploy for functions.
6. If RTDB requires an explicit regional `databaseURL`, add the exact console URL to `js/firebase-config.js`.
7. Push the static frontend to GitHub and enable GitHub Pages.

Never put service-account keys, Admin SDK credentials, OAuth secrets, or privileged tokens in the GitHub Pages frontend.

## V2.1 Finance Integration
- Project commercial terms: agreed vendor fee, payment scheme, DP %, included revisions, extra revision fee, payment due.
- Vendor acceptance automatically opens a linked finance expense record.
- Finance Hub covers income, expenses, pending payables, asset value, payroll-ready records and vendor invoices.
- Vendor project detail includes **Create Invoice**; invoice is linked to project/vendor and can be downloaded as a printable HTML invoice (Print → Save PDF).
- Complete Finance Report can be downloaded as XLSX for **Daily / Weekly / Monthly** periods with Summary, Transactions, Invoices, Payroll and Assets sheets.
- Expense categories and data dimensions follow the supplied `Master Data.xlsx`: Operasional, Produksi Konten, Talent, Software & Subscription, Marketing & Promotion, Peralatan & Asset, Transportasi, Administrasi, Event, Maintenance, Lainnya; payment statuses Paid/Pending/Cancelled.

### New Firestore collections
`financeTransactions`, `invoices`, `assets`, `payroll`.

### Finance permissions
Use `finance.view` for finance read access and `finance.manage` for transaction/payment management. Root/Admin are implicitly authorized by the current app permission helper.
