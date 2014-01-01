# A React.js Table Sorter Component #

A demo that implements a sortable table component using [Facebook's React](http://facebook.github.io/react/).  

Features:

- Remote data loading
- Sortable columns
- Filterable columns
- Repeatable headers

## Example ##

    var CONFIG = {
      sort: { column: "col2", order: "desc" },
      columns: {
        col1: { name: "Col1", filterText: "", defaultSortOrder: "desc"},
        col2: { name: "Col2", filterText: "", defaultSortOrder: "desc"},
        col3: { name: "Col3", filterText: "", defaultSortOrder: "desc"}
      }
    };

    React.renderComponent(<TableSorter dataSource="/api/data.json" config={CONFIG} headerRepeat="5" />, document.getElementById("table-sorter"));

## Running the Demo ##

    gem install sinatra
    ruby server.rb
    
View at: [http://localhost:4567/](http://localhost:4567/).

## Screenshots ##

![Demo Screenshot](http://i.imgur.com/vy5sMuW.png)
