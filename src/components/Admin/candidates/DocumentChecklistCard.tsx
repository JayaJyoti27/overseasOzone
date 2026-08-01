import { CheckCircle2, Download, Eye, FileX, Clock } from "lucide-react";

import { DOCUMENT_CATALOG } from "@/components/Candidate/documents/documentCatalog";

// Some historical document rows use slightly different type keys than the
// candidate-side catalog (e.g. "police_clearance_certificate" vs
// "vaccination_certificate"). Map catalog types -> known aliases so a
// document uploaded under an older key still matches the right checklist row.
const TYPE_ALIASES: Record<string, string[]> = {
  police_clearance_certificate: ["police_clearance_certificate", "police_clearance"],
  degree_certificate: ["degree_certificate", "educational_certificate"],
  medical_certificate: ["medical_certificate", "medical_report"],
  vaccination_certificate: ["vaccination_certificate", "vaccination"],
  visa: ["visa", "visa_copy"],
};

interface DocRow {
  id: string;
  document_type: string;
  file_name?: string;
  original_file_name?: string;
  public_url?: string;
  status?: string;
}

interface Props {
  documents: DocRow[];
}

function findDocument(documents: DocRow[], catalogType: string) {
  const aliases = TYPE_ALIASES[catalogType] ?? [catalogType];
  return documents.find((doc) => aliases.includes(doc.document_type));
}

function StatusBadge({ status }: { status?: string }) {
  const key = (status || "").toLowerCase();

  const styles: Record<string, string> = {
    verified: "bg-emerald-50 text-emerald-700",
    approved: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    under_review: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
    reupload_required: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        styles[key] ?? "bg-blue-wash text-blue"
      }`}
    >
      {status ?? "pending"}
    </span>
  );
}

export function DocumentChecklistCard({ documents }: Props) {
  const uploadedCount = DOCUMENT_CATALOG.filter((item) =>
    findDocument(documents, item.type),
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-ink/60">
        <span>Document Checklist</span>
        <span>
          {uploadedCount}/{DOCUMENT_CATALOG.length} uploaded
        </span>
      </div>

      {DOCUMENT_CATALOG.map((item) => {
        const doc = findDocument(documents, item.type);
        const fileLabel = doc?.original_file_name ?? doc?.file_name;

        if (!doc) {
          return (
            <div
              key={item.type}
              className="flex items-center justify-between rounded-2xl border border-dashed border-border px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-ink/60">
                <FileX size={16} />
                <span>
                  {item.label}
                  {item.required && <span className="ml-1 text-red-500">*</span>}
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                {item.required ? "Missing" : "Not uploaded"}
              </span>
            </div>
          );
        }

        return (
          <div
            key={item.type}
            className="rounded-2xl border border-border px-4 py-3 transition hover:border-blue"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-navy">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{item.label}</span>
              </div>
              <StatusBadge status={doc.status} />
            </div>

            {fileLabel && <p className="mt-1 truncate pl-6 text-xs text-ink/60">{fileLabel}</p>}

            <div className="mt-2 flex gap-2 pl-6">
              {/* Preview: opens the file in a new tab so it can be viewed inline
                  (images/PDFs render natively) instead of forcing a download. */}
              <a
                href={doc.public_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-navy hover:border-blue hover:text-blue"
              >
                <Eye size={12} />
              </a>

              <a
                href={doc.public_url}
                download
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-navy hover:border-blue hover:text-blue"
              >
                <Download size={12} />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
