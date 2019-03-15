import React, { Component } from 'react'
import SimpleTable, { SortDirection, ManualRow } from 'paged-table'

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
  columns = [{ key: "id", displayName: "User Id", headerStyle: { width: '100px' }, sortable: false },
  { key: "name", displayName: "Name" },
  { key: "status", displayName: "Status" },
  { key: "component", displayName: "Change Status" },
  {
    key: "date", displayName: "Date Test", formatter: (value) => {
      return value.toLocaleString()
    }
  }]

  constructor(props) {
    super(props)
    this.data = []
    this.columns = this.columns.map(c => {
      if (c.width == null) {
        // c.width = 100 / this.columns.length + "%"
      }
      return c
    })
    for (let i = 0; i < 20; i++) {
      let user = new User(i, "Test " + i)
      user.date = new Date();
      user.component = <div>
        <button onClick={(e) => {
          e.stopPropagation();
          user.enabled = !user.enabled;
          this.forceUpdate()
        }}>
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
        <SimpleTable
          clickable
          bordered
          onRowClicked={(id) => {
            const user = this.data.find((r) => r.id == id);
            if (user.injectBelow == null) {
              user.injectBelow = <ManualRow colSpan={this.columns.length}>
                <SimpleTable
                  clickable
                  columns={[{ key: "name", displayName: "Name" }]}
                  data={[{ name: "Nick" }, { name: "Arwen" }]} />
              </ManualRow>;
            } else {
              user.injectBelow = null;
            }
            this.forceUpdate()
          }}
          columns={this.columns}
          data={this.data} />
      </div>
    )
  }
}
