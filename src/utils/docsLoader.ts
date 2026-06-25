export interface DocItem {
  id: string;
  title: string;
}

export interface DocContent extends DocItem {
  content: string;
}

export async function getDocsList(): Promise<DocItem[]> {
  const response = await fetch("/api/docs");
  if (!response.ok) {
    throw new Error("Impossible de récupérer la liste des documents.");
  }
  return response.json();
}

export async function getDocContent(id: string): Promise<DocContent> {
  const response = await fetch(`/api/docs/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(`Impossible de récupérer le contenu pour le document "${id}".`);
  }
  return response.json();
}
