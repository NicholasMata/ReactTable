import React, { Component } from 'react'
import SimpleTable, { SortDirection } from 'paged-table'

class User {
  enabled = false
  constructor(id, name) {
    this.id = id
    this.name = name
  }

  status() {
    return this.enabled ? "true" : "false"
  }
}


export default class App extends Component {
  columns = [{ key: "id", displayName: "User Id" },
  { key: "name", displayName: "Name" },
  { key: "status", displayName: "Status" },
  { key: "component", displayName: "Change Status" },
  { key: "date", displayName: "Date Test", formatter: (value) => {
    return value.toLocaleString()
  } }]

  constructor(props) {
    super(props)
    this.data = []
    this.columns = this.columns.map(c => {
      c.width = 100 / this.columns.length + "%"
      return c
    })
    for (let i = 0; i < 20; i++) {
      let user = new User(i, "Test " + i)
      user.date = new Date();
      user.component = <div>
        <button onClick={() => { user.enabled = !user.enabled; this.forceUpdate() }}>
          Change Status
        </button>
      </div>
      this.data.push(user)
    }
  }
  render() {
    return (
      <div>
        <button onClick={() => { this.columns.pop(); this.forceUpdate(); }}>Remove Last Column</button>
        <SimpleTable idKey="id"
          onSortChange={(key, direction) => {
            console.log("Sorting by", key, direction)
            this.data = this.data.sort((a, b) => {
              let aValue = a[key]
              let bValue = b[key]
              if (direction == SortDirection.descending) {
                aValue = b[key]
                bValue = a[key]
              }
              if (aValue < bValue)
                return -1;
              if (aValue > bValue)
                return 1;
              return 0;
            })
            this.forceUpdate();
          }}
          columns={this.columns}
          data={this.data}
          pagingOptions={{ sizes: [10, 20, 30] }} />
      </div>
    )
  }
}
