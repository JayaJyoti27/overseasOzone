import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

import { issueCandidateOfferLetter } from "@/lib/employer/api";

interface Props {
  candidateId: string;
  onIssued: () => void;
}

export function IssueOfferLetterButton({ candidateId, onIssued }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      await issueCandidateOfferLetter(candidateId, file);
      onIssued();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to issue the offer letter.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFile}
      />

      <Button className="w-full" disabled={uploading} onClick={() => inputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Issue Offer Letter"}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
