import { Component } from 'react'
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronDoubleRight, faChevronLeft, faChevronDoubleLeft } from '@fortawesome/pro-solid-svg-icons'
import * as React from 'react';

export interface Props {
    maxButtonCount: number
    pageCount: number
    currentPage: number
    onChange: (page: number) => void
}

export interface State {
    currentPage: number
}

export default class PageButtonGroup extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            currentPage: props.currentPage
        }
    }
    onPageChange = (pageNum: number) => {
        let nextPage = pageNum
        if (pageNum == -1) {
            if (this.state.currentPage == 0) {return}
            nextPage = this.state.currentPage - 1
        } else if (pageNum == -2) {
            if (this.state.currentPage == this.props.pageCount - 1) {return}
            nextPage = this.state.currentPage + 1
        } else if (pageNum == -3) {
            nextPage = 0
        } else if (pageNum == -4) {
            nextPage = this.props.pageCount - 1
        }

        this.setState({
            currentPage: nextPage
        })
        this.props.onChange(nextPage)
    }

    render() {
        let buttonCount = this.props.maxButtonCount
        const currentPage = this.state.currentPage
        const pageCount = this.props.pageCount
        const firstHalf = Math.round(buttonCount / 2) - 1
        let start = currentPage <= firstHalf ? 0 : currentPage - firstHalf
        if (pageCount - start < buttonCount) {
            start = pageCount - buttonCount
        }
        if (start < 0) {
            start = 0;
        }
        if (buttonCount > pageCount) {
            buttonCount = pageCount;
        }
        // console.log(start, "Starting at")
        const pages = Array
            .apply(null, { length: buttonCount })
            .map(function (this: number, _: number, i: number) {
                return this + i
            }, start)
        return <ToggleButtonGroup
            type="radio"
            name="options"
            defaultValue={start}
            value={currentPage}
            onChange={this.onPageChange}>
            <ToggleButton
                value={-3}>
                <FontAwesomeIcon icon={faChevronDoubleLeft} />
            </ToggleButton>
            <ToggleButton
                value={-1}>
                <FontAwesomeIcon icon={faChevronLeft} />
            </ToggleButton>
            {pages.map((pageNum: number) => {
                return <ToggleButton key={"page"+pageNum}
                 value={pageNum}>{pageNum + 1}</ToggleButton>
            })}
            <ToggleButton
                value={-2}>
                <FontAwesomeIcon icon={faChevronRight} />
            </ToggleButton>
            <ToggleButton
                value={-4}>
                <FontAwesomeIcon icon={faChevronDoubleRight} />
            </ToggleButton>
        </ToggleButtonGroup>
    }
}