import { useRef } from "react";

import { CalendarDays, Download, Eye, FileText, RefreshCw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useDeleteDocument, useReplaceDocument } from "@/lib/candidate/hooks";

import type { CandidateDocument } from "@/lib/candidate/types";

interface Props {
  document: CandidateDocument;
}

export default function DocumentCard({ document }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const replaceDoc = useReplaceDocument();
  const remove = useDeleteDocument();

  function badge(status: string) {
    switch (status.toLowerCase()) {
      case "verified":
      case "approved":
        return "default";

      case "pending":
      case "under_review":
        return "secondary";

      case "rejected":
        return "destructive";

      default:
        return "outline";
    }
  }

  async function replace(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("document_type", document.document_type);

    await replaceDoc.mutateAsync({ id: document.id, formData: form });
  }

  return (
    <Card className="rounded-2xl p-6">
      <input
        hidden
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        onChange={(e) => {
          if (!e.target.files?.length) return;
          replace(e.target.files[0]);
        }}
      />

      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="rounded-xl bg-primary/10 p-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h2 className="font-semibold">{document.file_name}</h2>
            <p className="text-sm text-muted-foreground">{document.document_type}</p>
          </div>
        </div>

        <Badge variant={badge(document.status)}>{document.status}</Badge>
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Uploaded</span>
          <span>{new Date(document.created_at).toLocaleDateString()}</span>
        </div>

        {document.file_size && (
          <div className="flex justify-between">
            <span>Size</span>
            <span>{(document.file_size / 1024 / 1024).toFixed(2)}MB</span>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Replace
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={remove.isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              {remove.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {document.file_name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the file permanently. If this document is required for your
                application, you'll need to upload it again.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => remove.mutate(document.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
