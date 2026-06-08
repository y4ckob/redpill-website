# Enquiry form — Google Apps Script setup

The in-drawer enquiry form on the site can POST to a Google Apps Script
webhook that logs every enquiry to a Google Sheet and emails you a copy.
If the webhook URL is not set, the form falls back to a `mailto:` open.

The drawer sends two enquiry types to the same webhook, distinguished by
a `type` field in the JSON: `"product"` (the basket, with line items and
indicative total) and `"project"` (a full-install enquiry with an
"About the space" message instead of items). The script below handles both.

You only need to do this once. Follow the steps below in order.

---

## 1. Create the spreadsheet

1. Open https://sheets.google.com while signed in to `jack@redpillaudio.com`.
2. Click the blank "+" tile to create a new spreadsheet.
3. Rename the spreadsheet (top-left, where it says "Untitled spreadsheet")
   to **RedPill Enquiries**.

## 2. Open the Apps Script editor

1. Inside the spreadsheet menu: **Extensions → Apps Script**.
2. A new tab opens with a code editor and a default file called `Code.gs`.

## 3. Paste the script

1. Delete everything that is in `Code.gs` by default.
2. Paste the full script from the section "Apps Script code" below.
3. Click the floppy-disk save icon (or press ⌘+S).
4. When prompted, name the project **RedPill Enquiries**.

## 4. Deploy as a Web App

1. Click the blue **Deploy** button (top-right) → **New deployment**.
2. Next to **Select type**, click the gear icon → choose **Web app**.
3. Fill in:
   - **Description**: `v1`
   - **Execute as**: `Me (jack@redpillaudio.com)`
   - **Who has access**: **Anyone** *(important — the website is anonymous,
     so it must POST without a login)*
4. Click **Deploy**.
5. The first time, Google will ask you to authorise the script:
   - Click **Authorize access**.
   - Choose `jack@redpillaudio.com`.
   - You may see a screen that says "Google hasn't verified this app".
     Click **Advanced → Go to RedPill Enquiries (unsafe)**.
   - Click **Allow** to grant permissions (write to the sheet, send mail).

## 5. Copy the Web App URL

After a successful deploy you will see a **Web app URL** that looks like:

```
https://script.google.com/macros/s/AKfycb…………………………/exec
```

1. Click the **Copy** icon next to that URL.
2. Send it to me, or paste it directly into `assets/js/main.js`:

   ```js
   var ENQUIRY_WEBHOOK = "https://script.google.com/macros/s/XXXX/exec";
   ```

3. Save `main.js` and commit. The form will now POST live.

## 6. Quick sanity test

1. Paste the Web app URL into a browser tab and press Enter.
   - You should see the plain text `RedPill enquiry endpoint`.
   - This proves the script is reachable; it does not test the POST.
2. Open the site, add a product to your enquiry, fill in the drawer form,
   tick the Indonesia checkbox and submit. A new row should appear in the
   spreadsheet and an email should arrive at `contact@redpillaudio.com`.

## 7. If something goes wrong

- Nothing in the sheet, no email: check the Apps Script "Executions" tab
  (left sidebar inside the editor) for error logs.
- "We currently supply within Indonesia only" — the form will not submit
  until the checkbox is ticked. This is intentional.
- The submit button reverts and a `mailto:` opens instead — the fetch
  failed. Look at the browser console; usually it is a `CORS` issue from
  the wrong content-type header in `main.js` (it must stay `text/plain`).

---

## Apps Script code

Paste the entire block below into `Code.gs`:

```javascript
// RedPill Audio — enquiry webhook
// Receives JSON from the website enquiry drawer (two types: "product"
// for basket quotations, "project" for full-install enquiries), appends
// a row to this spreadsheet, and emails a notification.

var NOTIFY_EMAIL = "contact@redpillaudio.com";
var SHEET_NAME   = "Enquiries";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var type = data.type === "project" ? "project" : "product";

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Header row on first run
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Type",
        "Email",
        "WhatsApp",
        "Location",
        "Indonesia confirmed",
        "About the space",
        "Items",
        "Indicative total (IDR)"
      ]);
    }

    var items = data.items || [];
    var itemsText = items.map(function (i) {
      var line = i.name + (i.cat ? " (" + i.cat + ")" : "") + " × " + i.qty;
      if (typeof i.price === "number") {
        line += "  IDR " + i.price.toLocaleString("id-ID");
        if (i.unit) line += " " + i.unit;
      }
      return line;
    }).join("\n");

    var total = items.reduce(function (s, i) {
      return s + (typeof i.price === "number" ? i.price * i.qty : 0);
    }, 0);

    sheet.appendRow([
      data.ts || new Date().toISOString(),
      type,
      data.email    || "",
      data.whatsapp || "",
      data.location || "",
      data.indonesia ? "yes" : "no",
      data.message  || "",
      itemsText,
      total || ""
    ]);

    // Email notification
    try {
      var subject = "RedPill " + type + " enquiry — " + (data.email || "(no email)");
      var body =
        "Type:     " + type + "\n" +
        "Email:    " + (data.email    || "(not provided)") + "\n" +
        "WhatsApp: " + (data.whatsapp || "(not provided)") + "\n" +
        "Location: " + (data.location || "(not provided)") + "\n" +
        "Indonesia confirmed: " + (data.indonesia ? "yes" : "no") + "\n\n" +
        (data.message ? "About the space:\n" + data.message + "\n\n" : "") +
        (itemsText ? "Items:\n" + itemsText + "\n\n" : "") +
        (total
          ? "Indicative total (IDR): " + total.toLocaleString("id-ID") +
            "\n(Starting prices, before installation. Final quotation on application.)\n\n"
          : "") +
        "Timestamp: " + (data.ts || new Date().toISOString());
      MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
    } catch (mailErr) {
      // Mail can fail (quota etc.); the sheet row is still appended.
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput("RedPill enquiry endpoint")
    .setMimeType(ContentService.MimeType.TEXT);
}
```
