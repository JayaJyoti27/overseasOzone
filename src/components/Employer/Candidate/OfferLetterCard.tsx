import { useRef, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { uploadCandidateOfferLetter } from "@/lib/employer/api";

interface OfferLetterDocument {
  id: string;
  document_type: string;
  original_file_name?: string | null;
  public_url?: string | null;
  status?: string;
  created_at?: string;
}

interface Props {
  candidateId: string;
  documents: OfferLetterDocument[];
  onUploaded: () => void;
}

export function OfferLetterCard({ candidateId, documents, onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offerLetters = documents
    .filter((doc) => doc.document_type === "offer_letter")
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  const latest = offerLetters[0] ?? null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      await uploadCandidateOfferLetter(candidateId, file);
      onUploaded();
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message ?? "Unable to upload offer letter. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Letter</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {latest ? (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{latest.original_file_name || "Offer Letter"}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {latest.status ?? "pending"}
                </p>
              </div>
            </div>

            {latest.public_url && (
              <a
                href={latest.public_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                View
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No offer letter uploaded yet.</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          className="w-full"
          variant={latest ? "outline" : "default"}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : latest ? "Upload New Offer Letter" : "Upload Offer Letter"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
