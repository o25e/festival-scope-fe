export function filterAndSortDocuments(documents, filters, sortKey, direction) {
  return documents
    .filter((item) => (!filters.query || item.name.includes(filters.query)) && (!filters.region || item.region === filters.region) && (!filters.date || item.half === filters.date) && (!filters.score || item.score >= Number(filters.score)))
    .slice()
    .sort((a, b) => ((a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0) * direction))
}

export function scoreClass(score) {
  return score >= 80 ? 's-g' : score >= 70 ? 's-w' : 's-b'
}
