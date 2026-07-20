import { DocumentsPage } from './DocumentsPage';

export function DocumentsRecentsPage(props: any) {
  return <DocumentsPage {...props} initialFilters={{ ordering: '-created_at' }} />;
}
