import { documents } from '../data/documents'

// Replace these local adapters with HTTP calls when the backend is available.
export async function getFestivalDocuments() {
  return documents
}

export async function getFestivalReport(documentId) {
  return { documentId, status: 'ready' }
}
