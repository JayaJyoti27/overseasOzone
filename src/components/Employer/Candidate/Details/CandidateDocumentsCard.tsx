import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Document {
  id: string;
  document_type: string;
  original_file_name?: string | null;
  public_url?: string | null;
  status: string;
}

interface Props {
  documents: Document[];
}

export function CandidateDocumentsCard({ documents }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Documents</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4">
              <span className="capitalize">{doc.document_type.replace(/_/g, " ")}</span>

              {doc.public_url ? (
                <a
                  href={doc.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View
                </a>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">Not uploaded</span>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
