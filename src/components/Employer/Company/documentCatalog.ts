export interface DocumentCatalogItem {
  type: string;
  label: string;
  required: boolean;
  accept: string;
}

export const EMPLOYER_DOCUMENT_CATALOG: DocumentCatalogItem[] = [
  {
    type: "company_verification",
    label: "Company Verification Document",
    required: true,
    accept: ".pdf,.png,.jpg,.jpeg",
  },
  {
    type: "business_license",
    label: "Business License",
    required: true,
    accept: ".pdf,.png,.jpg,.jpeg",
  },
  {
    type: "commercial_registration",
    label: "Commercial Registration",
    required: true,
    accept: ".pdf,.png,.jpg,.jpeg",
  },
  {
    type: "tax_certificate",
    label: "Tax Certificate",
    required: true,
    accept: ".pdf,.png,.jpg,.jpeg",
  },
];
