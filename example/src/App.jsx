import React, { Component } from 'react'
import SimpleTable from 'paged-table'

class User {
  enabled = false
  constructor(id, name) {
    this.id = id
    this.name = name
  }

  status() {
    // console.log("THIS", this)
    return this.enabled ? "true" : "false"
  }
}


export default class App extends Component {
  columns = [{ key: "id", displayName: "User Id" },
  { key: "name", displayName: "Name" },
  { key: "status", displayName: "Status" },
  { key: "component", displayName: "Change Status" }]

  constructor(props) {
    super(props)
    this.data = []
    this.columns = this.columns.map(c => {
      c.width = 100 / this.columns.length + "%"
      return c
    })
    for (let i = 0; i < 1000; i++) {
      let user = new User(i, "Test " + i)
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
          onSortChange={(key) => {
            this.data.sort((a, b)=> {return a < b})
            // console.log("Sorting By key")
          }}
          columns={this.columns}
          data={this.data}
          pagingOptions={{ sizes: [10, 20, 30] }} />
      </div>
    )
  }
}
