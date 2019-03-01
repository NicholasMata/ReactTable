/**
 * @class SimpleTableComponent
 */

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css'
import * as React from 'react'
import { Table, Row, Col, Container, ButtonToolbar } from 'react-bootstrap';

import PageButtonGroup from './PageButtonGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/pro-solid-svg-icons';

export enum SortDirection {
  ascending, descending
}

export interface ColumnDefintion {
  key: string
  displayName: string
  formatter?: (value: any) => any
  width: string
  sortable: boolean
  sorter: (value: any) => number
}
export interface PagingOptions {
  sizes: number[]
}
export interface Props {
  columns: ColumnDefintion[]
  data: any
  idKey: string
  pagingOptions: PagingOptions
  onSortChange: (key: string, sortBy: SortDirection) => {}
}
export interface State {
  currentPage: number
  currentPageSize: number
  sorting: Map<string, SortDirection>
}
export default class SimpleTable extends React.Component<Props, State> {

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
    this.props.onSortChange(key, sortMap.get(key) || SortDirection.ascending)
  }

  render() {
    const dataset = this.getDataSet()
    const numberOfPages = this.numberOfPages()
    return (
      <Container fluid={true}>
        <Row>

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
        </Row>
        <Row>
          <Col md={12}>
            <Table bordered={true} responsive={true}>
              <thead>
                <tr>
                  {this.props.columns.map(column => {
                    const sortDirection = this.state.sorting.get(column.key);
                    column.sortable = column.sortable || true;
                    let showSort = column.sortable;
                    if (sortDirection == undefined) {
                      showSort = false;
                    }
                    return <th className="clickableColumn"
                      key={column.key}
                      onClick={() => { this.onColumnClicked(column.key, column.sortable) }}>
                      {column.displayName}
                      &nbsp;&nbsp;{showSort &&
                        (sortDirection == SortDirection.ascending ?
                          <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />)}
                    </th>
                  })}
                </tr>
              </thead>
              <tbody>
                {dataset.map((rowObj: any) => {
                  if (rowObj == null) {
                    return null
                  }
                  return <tr key={rowObj[this.props.idKey]}>
                    {this.props.columns.map(column => {
                      let columnData = rowObj[column.key];
                      if (column.formatter) {
                        columnData = column.formatter(columnData)
                      } else {
                        if (columnData instanceof Function) {
                          columnData = rowObj[column.key]()
                        } else if (columnData instanceof Date) {
                          columnData = columnData.toString()
                        }
                      }
                      return <td style={{ width: column.width }} key={column.key}>{columnData}</td>;
                    })}
                  </tr>
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row className="float-right">

          <Col md={12}>
            <ButtonToolbar>
              <PageButtonGroup
                currentPage={this.state.currentPage}
                maxButtonCount={5}
                pageCount={numberOfPages}
                onChange={this.onPageChange} />
            </ButtonToolbar>
          </Col>
        </Row>
      </Container>
    )
  }
}
