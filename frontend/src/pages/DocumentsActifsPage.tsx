import { DocumentsPage } from './DocumentsPage';

export function DocumentsActifsPage(props: any) {
  return <DocumentsPage {...props} initialFilters={{ is_archived: false }} />;
}
