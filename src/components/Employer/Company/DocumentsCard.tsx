import { useRef, useState } from "react";
import { BadgeCheck, Clock3, Trash2, Upload, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  useDeleteEmployerDocument,
  useEmployerDocuments,
  useUploadEmployerDocument,
} from "@/lib/employer/hooks";

import { EMPLOYER_DOCUMENT_CATALOG } from "./documentCatalog";

interface EmployerDocument {
  id: string;
  document_type: string;
  name: string;
  file_url: string;
  status: "pending" | "verified" | "rejected" | string;
}

export function DocumentsCard() {
  const { data: documents = [], isLoading } = useEmployerDocuments();
  const upload = useUploadEmployerDocument();
  const del = useDeleteEmployerDocument();

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [activeType, setActiveType] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const byType = new Map<string, EmployerDocument>(
    (documents as EmployerDocument[]).map((d) => [d.document_type, d]),
  );

  async function handleFile(type: string, file: File) {
    setActiveType(type);
    try {
      await upload.mutateAsync({ file, documentType: type });
    } finally {
      setActiveType(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await del.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Documents</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          EMPLOYER_DOCUMENT_CATALOG.map((item) => {
            const doc = byType.get(item.type);
            const isUploading = upload.isPending && activeType === item.type;
            const isDeleting = del.isPending && deletingId === doc?.id;

            return (
              <div
                key={item.type}
                className="flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium">
                    {item.label}
                    {item.required && <span className="ml-1 text-xs text-destructive">*</span>}
                  </h3>
                  {doc && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-primary"
                    >
                      {doc.name}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {doc ? (
                    <>
                      <StatusBadge status={doc.status} />
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isDeleting}
                        onClick={() => handleDelete(doc.id)}
                        title="Remove document"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <input
                        hidden
                        type="file"
                        accept={item.accept}
                        ref={(el) => {
                          inputRefs.current[item.type] = el;
                        }}
                        onChange={(e) => {
                          if (!e.target.files?.length) return;
                          handleFile(item.type, e.target.files[0]);
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => inputRefs.current[item.type]?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "verified") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
        <BadgeCheck className="h-4 w-4" />
        Verified
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
        <XCircle className="h-4 w-4" />
        Rejected
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
      <Clock3 className="h-4 w-4" />
      Pending
    </div>
  );
}
