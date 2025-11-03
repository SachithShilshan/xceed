// scripts/manifest-to-datasets.js
// Usage:
//   node scripts/manifest-to-datasets.js path/to/manifest.xlsx
//
// Requires: npm install xlsx fs-extra

const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const XLSX = require("xlsx");

const ARGV = process.argv.slice(2);
if (ARGV.length < 1) {
  console.error("Usage: node scripts/manifest-to-datasets.js manifest.xlsx");
  process.exit(1);
}
const manifestPath = ARGV[0];

if (!fs.existsSync(manifestPath)) {
  console.error("File not found:", manifestPath);
  process.exit(2);
}

const wb = XLSX.readFile(manifestPath, { cellDates: true });
const sheetDatabases = wb.Sheets["Databases"] || wb.Sheets["Database"] || wb.Sheets["DBs"];
const sheetFiles = wb.Sheets["Files"] || wb.Sheets["Files "];

if (!sheetDatabases) {
  console.error("Could not find a sheet named 'Databases' (case-sensitive).");
  process.exit(3);
}
if (!sheetFiles) {
  console.error("Could not find a sheet named 'Files' (case-sensitive).");
  process.exit(3);
}

const dbRows = XLSX.utils.sheet_to_json(sheetDatabases, { defval: "" });
const fileRows = XLSX.utils.sheet_to_json(sheetFiles, { defval: "" });

/**
 Expected columns in dbRows:
  Department, Section, DB_ID, DB_Name, DB_Type, EmbedURL, Description
 Expected columns in fileRows:
  DB_ID, File_ID, File_Name, File_Type, URL, Description
*/

// Build a nested manifest: company -> Department -> Section -> DB_Name -> { dashId, dataset: { files: [...] } }

const out = { company: {} };

const warnings = [];

function ensureDepartment(deptName) {
  if (!out.company[deptName]) out.company[deptName] = {};
  return out.company[deptName];
}

// process databases
dbRows.forEach((r, i) => {
  const rowIndex = i + 2;
  const Department = (r.Department || "").toString().trim();
  const Section = (r.Section || "").toString().trim();
  const DB_ID = (r.DB_ID || r.DBId || r.db_id || "").toString().trim();
  const DB_Name = (r.DB_Name || r.DBName || r.DB || "").toString().trim();
  const DB_Type = (r.DB_Type || r.Type || "").toString().trim();
  const EmbedURL = (r.EmbedURL || r.EmbedUrl || "").toString().trim();
  const Description = (r.Description || "").toString().trim();

  if (!Department || !Section || !DB_ID || !DB_Name) {
    warnings.push(`Databases sheet row ${rowIndex}: missing required fields (Department, Section, DB_ID, DB_Name).`);
    return;
  }

  const dept = ensureDepartment(Department);
  if (!dept[Section]) dept[Section] = {};
  dept[Section][DB_Name] = {
    dashId: DB_ID,
    type: DB_Type || undefined,
    embedUrl: EmbedURL || undefined,
    description: Description || "",
    dataset: { files: [] }
  };
});

// index DBs by DB_ID for quick lookup
const dbIdIndex = {};
Object.entries(out.company).forEach(([deptName, sections]) => {
  Object.entries(sections).forEach(([sectionName, dashboards]) => {
    Object.entries(dashboards).forEach(([dashName, dashObj]) => {
      if (dashObj && dashObj.dashId) {
        dbIdIndex[dashObj.dashId] = { deptName, sectionName, dashName, dashObj };
      }
    });
  });
});

// process files
fileRows.forEach((r, i) => {
  const rowIndex = i + 2;
  const DB_ID = (r.DB_ID || r.dbId || r.db_id || "").toString().trim();
  const File_ID = (r.File_ID || r.FileId || r.file_id || `file-${Date.now()}-${i}`).toString().trim();
  const File_Name = (r.File_Name || r.FileName || r.Name || "").toString().trim();
  const File_Type = (r.File_Type || r.Type || "").toString().trim().toLowerCase();
  const URL = (r.URL || r.Url || r.Link || "").toString().trim();
  const Description = (r.Description || "").toString().trim();

  if (!DB_ID || !File_Name || !URL) {
    warnings.push(`Files sheet row ${rowIndex}: DB_ID, File_Name and URL are required.`);
    return;
  }

  const dbEntry = dbIdIndex[DB_ID];
  if (!dbEntry) {
    warnings.push(`Files sheet row ${rowIndex}: DB_ID '${DB_ID}' not found in Databases sheet.`);
    return;
  }

  const fileObj = {
    id: File_ID || `file-${Date.now()}-${i}`,
    name: File_Name,
    type: (File_Type === "local" || File_Type === "external") ? File_Type : (URL.startsWith("/") ? "local" : "external"),
    url: URL,
    description: Description || ""
  };

  dbEntry.dashObj.dataset.files.push(fileObj);
});

// create target path
const outPath = path.join(process.cwd(), "src", "data", "datasets.json");
fse.ensureDirSync(path.dirname(outPath));

// create public data directories for local files
Object.entries(out.company).forEach(([deptName, sections]) => {
  Object.entries(sections).forEach(([sectionName, dashboards]) => {
    Object.entries(dashboards).forEach(([dashName, dashObj]) => {
      const files = (dashObj.dataset && dashObj.dataset.files) || [];
      files.forEach(f => {
        if (f.type === "local") {
          const cleanDept = deptName.replace(/[^\w-]/g, "_").toLowerCase();
          const cleanSection = sectionName.replace(/[^\w-]/g, "_").toLowerCase();
          const dbFolder = path.join("public", "data", cleanDept, cleanSection, dashObj.dashId || dashName.replace(/\s+/g, "_"));
          fse.ensureDirSync(dbFolder);
          // create placeholder README explaining where to add file
          const placeholder = path.join(dbFolder, `.README_${f.id}.md`);
          if (!fs.existsSync(placeholder)) {
            fs.writeFileSync(placeholder, `Placeholder for ${f.name}\n\nDrop the real file at: ${path.posix.join("/", dbFolder, path.basename(f.url))}\n`, "utf8");
          }
        }
      });
    });
  });
});

// write datasets.json with pretty print
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");

console.log("Created src/data/datasets.json");
if (warnings.length) {
  console.log("\nWarnings:");
  warnings.forEach(w => console.log(" -", w));
} else {
  console.log("No warnings.");
}

console.log("\nPublic local folders created for any 'local' file entries (placeholders).");
