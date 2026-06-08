export interface LinkType {
  slug: string;
  targetUrl: string;
  clicks: number;
  createdAt: string;
}

// Global in-memory store
declare global {
  var _linkStore: LinkType[] | undefined;
}

const store = global._linkStore || [];
if (process.env.NODE_ENV !== 'production') {
  global._linkStore = store;
}

export async function getLinks(query = '', page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc') {
  let filtered = store;
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = store.filter(l => l.slug.toLowerCase().includes(lowerQuery) || l.targetUrl.toLowerCase().includes(lowerQuery));
  }

  // Sort
  filtered.sort((a: any, b: any) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
    if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const links = filtered.slice(skip, skip + limit);

  return { links, total };
}

export async function getLinkBySlug(slug: string) {
  return store.find(l => l.slug === slug);
}

export async function addLink(link: Omit<LinkType, 'clicks' | 'createdAt'>) {
  const newLink: LinkType = {
    ...link,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };
  store.push(newLink);
  return newLink;
}

export async function updateLink(slug: string, targetUrl: string) {
  const index = store.findIndex(l => l.slug === slug);
  if (index !== -1) {
    store[index].targetUrl = targetUrl;
    return store[index];
  }
  return null;
}

export async function deleteLink(slug: string) {
  const index = store.findIndex(l => l.slug === slug);
  if (index !== -1) {
    const deleted = store[index];
    store.splice(index, 1);
    return deleted;
  }
  return null;
}
