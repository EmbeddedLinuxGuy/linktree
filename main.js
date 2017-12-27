#!/usr/bin/env node

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
//  password : 'secret',
  database : 'webtrace'
});

connection.connect();

var query = `
select (select title from moz_places
                   where id=(select i.place_id from moz_historyvisits i
                                               where i.id=h.from_visit))
               AS parent_page,
       (select title from moz_places where id=h.place_id) as child_page
       from moz_historyvisits h`;
//       where h.from_visit !=0 and h.place_id !=0 `;

var red = "\033[31m";
var green = "\033[32m";
var yellow = "\033[33m";

connection.query(query, function (error, results, fields) {
    if (error) throw error;
    for (i=0; i < results.length; i++) {
	if (results[i].parent_page !== null && results[i].child_page !== null) {
	    console.log(`${red}${results[i].parent_page} ${green}-> ${yellow}${results[i].child_page}`);
	    console.log('--');
	}
    }
});

connection.end();
