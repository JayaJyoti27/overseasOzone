-- Prevents duplicate employer document rows (e.g. from a double-submitted
-- registration form) by enforcing one row per (employer_id, document_type).
-- The application's uploadEmployerDocument() now upserts on this pair, so a
-- retried/duplicate submit overwrites the existing row instead of creating
-- a new one.

-- Clean up any duplicates that already exist before adding the constraint,
-- keeping only the most recently uploaded row per (employer_id, document_type).
delete from employer_documents a
using employer_documents b
where a.employer_id = b.employer_id
  and a.document_type = b.document_type
  and a.uploaded_at < b.uploaded_at;

alter table employer_documents
  add constraint employer_documents_employer_id_document_type_key
  unique (employer_id, document_type);
