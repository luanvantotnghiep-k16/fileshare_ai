export default interface IPagedList<TDocument> {
  documents: TDocument[];
  totalCount: number;
  page: number;
  limit: number;
}
