/** @jsx React.DOM */

// TableSorter Config
var CONFIG = {
  sort: { column: "col2", order: "desc" },
  columns: {
    col1: { name: "Col1", filterText: "", defaultSortOrder: "desc"},
    col2: { name: "Col2", filterText: ">= 30", defaultSortOrder: "desc"},
    col3: { name: "Col3", filterText: "s", defaultSortOrder: "desc"}
  }
};

// Inequality function map for the filtering
var operators = {
  "<": function(x, y) { return x < y; },
  "<=": function(x, y) { return x <= y; },
  ">": function(x, y) { return x > y; },
  ">=": function(x, y) { return x >= y; },
  "==": function(x, y) { return x == y; }
};

// TableSorter React Component
var TableSorter = React.createClass({
  getInitialState: function() {
    return {
      items: this.props.initialItems || [],
      sort: this.props.config.sort || { column: "", order: "" },
      columns: this.props.config.columns
    };
  },
  componentWillReceiveProps: function(nextProps) {
    // Load new data when the dataSource property changes.
    if (nextProps.dataSource != this.props.dataSource) {
      this.loadData(nextProps.dataSource);
    }
  },
  componentWillMount: function() {
    this.loadData(this.props.dataSource);
  },
  loadData: function(dataSource) {
    if (!dataSource) return;

    $.get(dataSource).done(function(data) {
      console.log("Received data");
      this.setState({items: data});
    }.bind(this)).fail(function(error, a, b) {
      console.log("Error loading JSON");
    });
  },
  handleFilterTextChange: function(column) {
    return function(newValue) {
      var obj = this.state.columns;
      obj[column].filterText = newValue;

      // Since we have already mutated the state, just call forceUpdate().
      // Ideally we'd copy and setState or use an immutable data structure.
      this.forceUpdate();
    }.bind(this);
  },
  columnNames: function() {
     return Object.keys(this.state.columns); 
  },
  sortColumn: function(column) {
    return function(event) {
      var newSortOrder = (this.state.sort.order == "asc") ? "desc" : "asc";

      if (this.state.sort.column != column) {
          newSortOrder = this.state.columns[column].defaultSortOrder;
      }

      this.setState({sort: { column: column, order: newSortOrder }});
    }.bind(this);
  },
  sortClass: function(column) {
    var ascOrDesc = (this.state.sort.order == "asc") ? "headerSortAsc" : "headerSortDesc";
    return (this.state.sort.column == column) ? ascOrDesc : "";
  },
  render: function() {
    var rows = [];

    var columnNames = this.columnNames();
    var filters = {};

    var operandRegex = /^((?:(?:[<>]=?)|==))\s?([-]?\d+(?:\.\d+)?)$/;

    columnNames.forEach(function(column) {
      var filterText = this.state.columns[column].filterText;
      filters[column] = null;

      if (filterText.length > 0) { 
        operandMatch = operandRegex.exec(filterText);
        if (operandMatch && operandMatch.length == 3) {
          //filters[column] = Function.apply(null, ["x", "return x " + operandMatch[1] + " " + operandMatch[2]]);
          filters[column] = function(match) { return function(x) { return operators[match[1]](x, match[2]); }; }(operandMatch); 
        } else {
          filters[column] = function(x) {
            return (x.toString().toLowerCase().indexOf(filterText.toLowerCase()) > -1);
          };
        }
      }
    }, this);
    
    var filteredItems = _.filter(this.state.items, function(item) {
      return _.every(columnNames, function(c) {
        return (!filters[c] || filters[c](item[c]));
      }, this);
    }, this);

    var sortedItems = _.sortBy(filteredItems, this.state.sort.column);
    if (this.state.sort.order === "desc") sortedItems.reverse();

    var headerExtra = function() {
      return columnNames.map(function(c) {
        return <th className="header-extra">{this.state.columns[c].name}</th>;
      }, this);   
    }.bind(this);

    var cell = function(x) {
      return columnNames.map(function(c) {
        return <td>{x[c]}</td>;
      }, this);
    }.bind(this);

    sortedItems.forEach(function(item, idx) {
      var headerRepeat = parseInt(this.props.headerRepeat, 10);
      if ((this.props.headerRepeat > 0) && 
          (idx > 0) &&
          (idx % this.props.headerRepeat === 0)) {

          rows.push (
            <tr>
              { headerExtra() }
            </tr>
          )
      }

      rows.push(
        <tr key={item.id}>
          { cell(item) }
        </tr>
      );
    }.bind(this));

    var filterLink = function(column) {
      return {
        value: this.state.columns[column].filterText,
        requestChange: this.handleFilterTextChange(column)
      };
    }.bind(this);

    var header = columnNames.map(function(c) {
      return <th onClick={this.sortColumn(c)} className={"header " + this.sortClass(c)}>{this.state.columns[c].name}</th>;
    }, this);

    var filterInputs = columnNames.map(function(c) {
      return <td><input type="text" valueLink={filterLink(c)} /></td>;
    }, this);

    return (
      <table cellSpacing="0" className="tablesorter">
        <thead>
          <tr>
            { header }
          </tr>
          <tr>
            { filterInputs }
          </tr>
        </thead>
        <tbody>
          { rows }
        </tbody>
      </table>
    );
  }
});

/* Here we create a two selects to control the remote data source of the 
 * TableSorter component. The purpose of this is to show how to control a 
 * component with another component.
 */
var DataSourceSelectors = React.createClass({
  handleSourceChange: function(event) {
    this.props.onSourceChange({
      source: event.target.value,
      limit: this.props.source.limit
    });
  },
  handleLimitChange: function(event) {
    this.props.onSourceChange({
      source: this.props.source.source,
      limit: event.target.value
    });
  },
  render: function() {
    return (
      <div id="tools">
        <strong>Source:</strong> 
        <select onChange={this.handleSourceChange} value={this.props.source.source}>
          <option value="source1">Source 1</option>
          <option value="source2">Source 2</option>
        </select>

        <strong>Limit:</strong> 
        <select onChange={this.handleLimitChange} value={this.props.source.limit}>
          <option value="10">10</option>
          <option value="200">200</option>
        </select>
      </div>
    );
  }
});

function urlForDataSource(source) {
  return "json/" + source.source + "_" + source.limit + ".json";
}

var App = React.createClass({
  getInitialState: function() {
    return {source: {limit: "200", source: "source1"}};
  },
  handleSourceChange: function(source) {
    this.setState({source: source});
  },
  render: function() {
    return (
      <div>
        <DataSourceSelectors onSourceChange={this.handleSourceChange} source={this.state.source} />
        <TableSorter dataSource={urlForDataSource(this.state.source)} config={CONFIG} headerRepeat="5" />
      </div>
    );
  }
});

React.renderComponent(<App />, document.getElementById("app"));
