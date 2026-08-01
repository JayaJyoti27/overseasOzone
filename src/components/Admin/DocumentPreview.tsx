import { useState } from "react";
import { FileText, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Doc {
  id: string;
  file_url: string;
  file_name?: string;
  document_type?: string;
}

function isImage(url: string) {
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);
}
function isPdf(url: string) {
  return /\.pdf(\?|$)/i.test(url);
}

export function DocumentPreviewList({ documents }: { documents: Doc[] }) {
  const [active, setActive] = useState<Doc | null>(null);

  if (!documents?.length) {
    return <p className="text-sm text-ink">No company document uploaded yet.</p>;
  }

  return (
    <>
      <div className="space-y-2">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setActive(doc)}
            className="flex w-full items-center gap-2 rounded-xl bg-blue-wash/40 px-3 py-2 text-left text-sm text-blue hover:bg-blue-wash"
          >
            <FileText className="h-4 w-4 shrink-0" />
            {doc.file_name || doc.document_type || "Document"}
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold text-navy">
                {active.file_name || active.document_type || "Document"}
              </h4>
              <div className="flex items-center gap-2">
                <a href={active.file_url} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
                <Button size="sm" variant="ghost" onClick={() => setActive(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isImage(active.file_url) ? (
              <img src={active.file_url} alt={active.file_name} className="w-full rounded-lg" />
            ) : isPdf(active.file_url) ? (
              <iframe
                src={active.file_url}
                className="h-[70vh] w-full rounded-lg"
                title="Document preview"
              />
            ) : (
              <p className="text-sm text-ink">
                No inline preview available for this file type —{" "}
                <a
                  href={active.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue underline"
                >
                  open it directly
                </a>
                .
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
