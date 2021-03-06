/**
 * @class SimpleTableComponent
 */

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css'
import * as React from 'react'
import { Table, Row, Col, Container, ButtonToolbar } from 'react-bootstrap';

import PageButtonGroup from './PageButtonGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

export enum SortDirection {
  ascending, descending
}

export interface ColumnDefintion {
  key: string
  displayName: string
  formatter?: (value: any, key: string, row: any) => any
  width: string
  sortable: boolean
  sorter: (value: any) => number
  headerStyle: any,
  cellStyle: any,
  colSpan: number
}

export interface PagingOptions {
  sizes: number[]
  enabled: boolean
}
export interface Props {
  columns: ColumnDefintion[]
  data: any[]
  idKey: string
  pagingOptions: PagingOptions
  clickable: boolean
  onSortChange?: (key: string, sortBy: SortDirection) => {}
  onRowClicked?: (id: string | number) => {}
  onColumnRefs?: (refs: { [key: string]: React.RefObject<HTMLTableDataCellElement>; }) => void
  bordered: boolean
  noDataElement: JSX.Element
  containerStyle: React.CSSProperties | undefined
  showHeader: boolean
}
export interface State {
  currentPage: number
  currentPageSize: number
  sorting: Map<string, SortDirection>
}

export class ManualRow extends React.Component<any> {
  render() {
    return <tr {... this.props} >
      {this.props.children}
    </tr>
  }
}

export class ManualCol extends React.Component<any> {
  render() {
    return <td {... this.props} >
      {this.props.children}
    </td>
  }
}

export default class SimpleTable extends React.Component<Props, State> {
  static defaultProps = {
    idKey: "id",
    clickable: false,
    pagingOptions: { sizes: [10, 20, 30] },
    showHeader: true
  }

  public tdRefs: { [key: string]: React.RefObject<HTMLTableDataCellElement>; } = {}

  constructor(props: Props) {
    super(props)
    this.state = {
      currentPage: 0,
      currentPageSize: props.pagingOptions.sizes[0],
      sorting: new Map<string, SortDirection>()
    }
  }

  numberOfPages(): number {
    let currentPageSize = this.state.currentPageSize
    let dataLength = this.props.data.length
    return Math.ceil(dataLength / currentPageSize)
  }

  getDataSet(): any[] {
    let currentPage = this.state.currentPage
    let pageSize = this.state.currentPageSize
    let dataLength = this.props.data.length
    let data = this.props.data
    let pagedData = []
    let pageStart = currentPage * pageSize
    let pageEnd = pageStart + pageSize
    if (pageEnd > dataLength) {
      pageEnd = dataLength
    }
    for (let i = pageStart; i < pageEnd; i++) {
      const element = data[i]
      if (element != null && element.child === undefined) {
        pagedData.push(element)
      } else {
        pageEnd++;
      }
    }
    return pagedData
  }

  onPageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      currentPageSize: parseInt(event.target.value)
    })
  }

  onPageChange = (pageNum: number) => {
    this.setState({
      currentPage: pageNum
    })
  }

  componentDidUpdate() {

  }

  componentDidMount() {
    if (this.props.onColumnRefs) {
      this.props.onColumnRefs(this.tdRefs)
    }
  }

  onColumnClicked = (key: string, shouldSort: boolean) => {
    if (!shouldSort) {
      console.log("Not sorting", key, shouldSort)
      return
    }
    let sortMap = this.state.sorting;
    let sortDirection = sortMap.get(key);
    if (sortDirection == null) {
      sortMap = new Map<string, SortDirection>()
      sortMap.set(key, SortDirection.ascending)
    } else {
      sortMap.set(key, sortDirection == SortDirection.ascending ? SortDirection.descending : SortDirection.ascending)
    }
    this.setState({
      sorting: sortMap
    })
    // this.props.data = this.props.data.sort()
    this.props.onSortChange && this.props.onSortChange(key, sortMap.get(key) || SortDirection.ascending)
  }

  render() {
    const dataset = this.getDataSet()
    const numberOfPages = this.numberOfPages()

    var tableBody = dataset.map((rowObj: any, i: number) => {
      if (rowObj == null) {
        return null
      }
      const key = rowObj[this.props.idKey];
      return (<React.Fragment key={i}>
        {rowObj.injectAbove}
        <tr className={!this.props.clickable ? "no-hover" : ""} key={key} onClick={() => (this.props.clickable && this.props.onRowClicked && this.props.onRowClicked(key))}>
          {this.props.columns.map(column => {

            let columnData = rowObj[column.key];
            if (column.formatter) {
              columnData = column.formatter(columnData, column.key, rowObj)
            } else {
              if (columnData instanceof Function) {
                columnData = rowObj[column.key]()
              } else if (columnData instanceof Date) {
                columnData = columnData.toString()
              }
            }
            const tdRef = React.createRef<HTMLTableDataCellElement>();
            this.tdRefs[column.key] = tdRef;
            return <td ref={tdRef} style={{ ...column.cellStyle }} key={column.key}>{columnData}</td>;
          })}
        </tr>
        {rowObj.injectBelow}
      </React.Fragment>)
    });
    if (tableBody.length == 0) {
      tableBody.push(this.props.noDataElement)
    }
    return (
      <Container fluid={true} {...{ style: this.props.containerStyle }}>
        {numberOfPages > 1 && this.props.pagingOptions.enabled && <Row>
          <Col md={12}>
            {"Showing "}
            <select onChange={this.onPageSizeChange}>
              {this.props.pagingOptions.sizes.map((size) => {
                return (
                  <option key={size} value={size}>
                    {size}
                  </option>
                );
              })}
            </select>
            {" entries"}
          </Col>
        </Row>}
        <Row>
          <Col md={12}>
            <Table bordered={this.props.bordered} responsive hover={this.props.clickable}>
              {this.props.showHeader && <thead>
                <tr className="no-hover">
                  {this.props.columns.map(column => {
                    const sortDirection = this.state.sorting.get(column.key);
                    column.sortable = column.sortable
                    if (column.sortable == null) {
                      column.sortable = true
                    }
                    let showSort = column.sortable;
                    if (sortDirection == undefined) {
                      showSort = false;
                    }
                    return <th
                      {...column.colSpan}
                      className={column.sortable ? "clickableColumn" : ""}
                      key={column.key}
                      style={{ ...column.headerStyle }}
                      onClick={() => { this.onColumnClicked(column.key, column.sortable) }}>
                      {column.displayName}
                      {showSort &&
                        <React.Fragment>
                          <span>&nbsp;&nbsp;</span>
                          {sortDirection == SortDirection.ascending ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />}
                        </React.Fragment>}
                    </th>
                  })}
                </tr>
              </thead>}
              <tbody>
                {this.props.children}
                {tableBody}
              </tbody>
            </Table>
          </Col>
        </Row>
        {numberOfPages > 1 && this.props.pagingOptions.enabled && <Row className="float-right">

          <Col md={12}>
            <ButtonToolbar>
              <PageButtonGroup
                currentPage={this.state.currentPage}
                maxButtonCount={5}
                pageCount={numberOfPages}
                onChange={this.onPageChange} />
            </ButtonToolbar>
          </Col>
        </Row>}
      </Container>
    )
  }
}